const Redis = require('ioredis');

/**
 * Enhanced Redis Client for Instagram Automation
 * Handles all data persistence and caching needs
 */
class EnhancedRedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      let redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL || 'redis://localhost:6379';
      
      // Clean up the Redis URL (remove any leading/trailing whitespace and encoded spaces)
      redisUrl = redisUrl.trim().replace(/^%20/, '').replace(/%20$/, '');
      
      console.log('🔗 Connecting to Enhanced Redis...');
      console.log('📍 Redis URL (masked):', redisUrl.replace(/:[^:@]*@/, ':****@'));
      
      // Only use TLS if URL explicitly starts with rediss://
      const needsTLS = redisUrl.startsWith('rediss://');
      
      const redisOptions = {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        reconnectOnError: (err) => err.message.includes('READONLY'),
        enableReadyCheck: true,
        lazyConnect: false
      };
      
      // Only add TLS for rediss:// URLs
      if (needsTLS) {
        console.log('🔒 TLS enabled for Redis connection');
        redisOptions.tls = {
          rejectUnauthorized: false
        };
      } else {
        console.log('🔓 Using non-TLS connection');
      }
      
      this.client = new Redis(redisUrl, redisOptions);

      this.client.on('connect', () => {
        console.log('✅ Enhanced Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
      });

      await this.client.ping();
      this.isConnected = true;
      
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      throw error;
    }
  }

  async getClient() {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    return this.client;
  }

  // ============================================
  // 1. USER MANAGEMENT
  // ============================================
  
  async saveUser(userId, userData) {
    const client = await this.getClient();
    const key = `user:${userId}`;
    const data = JSON.stringify({
      ...userData,
      updatedAt: new Date().toISOString()
    });
    
    await client.set(key, data);
    await client.sadd('users:all', userId);
    
    // Index by Instagram account if available
    if (userData.instagram_account_id) {
      await client.set(`ig:user:${userData.instagram_account_id}`, userId);
    }
    
    return true;
  }

  async getUser(userId) {
    const client = await this.getClient();
    const data = await client.get(`user:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async getUserByInstagramId(igAccountId) {
    const client = await this.getClient();
    const userId = await client.get(`ig:user:${igAccountId}`);
    if (!userId) return null;
    return this.getUser(userId);
  }

  // ============================================
  // 2. AUTOMATION RULES STORAGE
  // ============================================
  
  async saveReelAutomation(reelId, automationData) {
    const client = await this.getClient();
    const key = `automation:reel:${reelId}`;
    const data = JSON.stringify({
      ...automationData,
      id: reelId,
      updatedAt: new Date().toISOString(),
      createdAt: automationData.createdAt || new Date().toISOString()
    });
    
    await client.set(key, data);
    await client.sadd('automations:reels', reelId);
    
    // Index by user if available
    if (automationData.userId) {
      await client.sadd(`user:${automationData.userId}:automations`, reelId);
    }
    
    return true;
  }

  async getReelAutomation(reelId) {
    const client = await this.getClient();
    const data = await client.get(`automation:reel:${reelId}`);
    return data ? JSON.parse(data) : null;
  }

  async getAllReelAutomations(userId = null) {
    const client = await this.getClient();
    const setKey = userId ? `user:${userId}:automations` : 'automations:reels';
    const reelIds = await client.smembers(setKey);
    
    const automations = {};
    for (const reelId of reelIds) {
      const automation = await this.getReelAutomation(reelId);
      if (automation) {
        automations[reelId] = automation;
      }
    }
    
    return automations;
  }

  async deleteReelAutomation(reelId, userId = null) {
    const client = await this.getClient();
    
    await client.del(`automation:reel:${reelId}`);
    await client.srem('automations:reels', reelId);
    
    if (userId) {
      await client.srem(`user:${userId}:automations`, reelId);
    }
    
    return true;
  }

  // DM Automation Settings
  async saveDMAutomation(accountId, automationData) {
    const client = await this.getClient();
    const key = `automation:dm:${accountId}`;
    const data = JSON.stringify({
      ...automationData,
      accountId,
      updatedAt: new Date().toISOString()
    });
    
    await client.set(key, data);
    await client.sadd('automations:dm', accountId);
    
    return true;
  }

  async getDMAutomation(accountId) {
    const client = await this.getClient();
    const data = await client.get(`automation:dm:${accountId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteDMAutomation(accountId) {
    const client = await this.getClient();
    
    await client.del(`automation:dm:${accountId}`);
    await client.srem('automations:dm', accountId);
    
    return true;
  }

  // ============================================
  // 3. COMMENT TRACKING & DEDUPLICATION
  // ============================================
  
  async markCommentAsReplied(commentId, replyData = {}) {
    const client = await this.getClient();
    const key = `comment:replied:${commentId}`;
    const data = JSON.stringify({
      ...replyData,
      repliedAt: new Date().toISOString()
    });
    
    // Store with 30 days expiry
    await client.setex(key, 2592000, data);
    
    // Add to daily analytics
    const today = new Date().toISOString().split('T')[0];
    await client.sadd(`analytics:comments:${today}`, commentId);
    await client.expire(`analytics:comments:${today}`, 86400 * 30);
    
    // Increment counters
    await client.hincrby('stats:global', 'total_comments_replied', 1);
    await client.hincrby(`stats:daily:${today}`, 'comments_replied', 1);
    
    return true;
  }

  async hasCommentBeenReplied(commentId) {
    const client = await this.getClient();
    const exists = await client.exists(`comment:replied:${commentId}`);
    return exists === 1;
  }

  // ============================================
  // 4. DM TRACKING & ANALYTICS
  // ============================================
  
  async trackDMSent(userId, recipientId, messageData) {
    const client = await this.getClient();
    const messageId = `dm:${Date.now()}:${userId}:${recipientId}`;
    
    const data = JSON.stringify({
      userId,
      recipientId,
      ...messageData,
      sentAt: new Date().toISOString()
    });
    
    // Store message record
    await client.setex(messageId, 604800, data); // 7 days
    
    // Add to user's sent messages
    await client.lpush(`user:${userId}:dms:sent`, messageId);
    await client.ltrim(`user:${userId}:dms:sent`, 0, 999); // Keep last 1000
    
    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    await client.hincrby('stats:global', 'total_dms_sent', 1);
    await client.hincrby(`stats:daily:${today}`, 'dms_sent', 1);
    
    // Track unique recipients
    await client.sadd(`user:${userId}:dm:recipients`, recipientId);
    
    return messageId;
  }

  async getDMHistory(userId, limit = 50) {
    const client = await this.getClient();
    const messageIds = await client.lrange(`user:${userId}:dms:sent`, 0, limit - 1);
    
    const messages = [];
    for (const messageId of messageIds) {
      const data = await client.get(messageId);
      if (data) {
        messages.push(JSON.parse(data));
      }
    }
    
    return messages;
  }

  // ============================================
  // 5. RATE LIMITING & QUOTAS
  // ============================================
  
  async checkRateLimit(identifier, maxRequests = 10, windowSeconds = 60) {
    const client = await this.getClient();
    const key = `ratelimit:${identifier}`;
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    
    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
      resetIn: await client.ttl(key),
      current
    };
  }

  async checkDailyQuota(userId, quotaType, maxQuota) {
    const client = await this.getClient();
    const today = new Date().toISOString().split('T')[0];
    const key = `quota:${userId}:${quotaType}:${today}`;
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, 86400); // 24 hours
    }
    
    return {
      allowed: current <= maxQuota,
      remaining: Math.max(0, maxQuota - current),
      used: current,
      maxQuota
    };
  }

  // ============================================
  // 6. SESSION MANAGEMENT
  // ============================================
  
  async createSession(userId, sessionData) {
    const client = await this.getClient();
    const sessionId = `session:${userId}:${Date.now()}`;
    
    const data = JSON.stringify({
      userId,
      ...sessionData,
      createdAt: new Date().toISOString()
    });
    
    // Store session with 7 days expiry
    await client.setex(sessionId, 604800, data);
    
    // Track active sessions
    await client.sadd(`user:${userId}:sessions`, sessionId);
    
    return sessionId;
  }

  async getSession(sessionId) {
    const client = await this.getClient();
    const data = await client.get(sessionId);
    return data ? JSON.parse(data) : null;
  }

  async invalidateSession(sessionId) {
    const client = await this.getClient();
    const session = await this.getSession(sessionId);
    
    if (session) {
      await client.del(sessionId);
      await client.srem(`user:${session.userId}:sessions`, sessionId);
    }
    
    return true;
  }

  // ============================================
  // 7. ANALYTICS & METRICS
  // ============================================
  
  async getAnalytics(period = 'today') {
    const client = await this.getClient();
    const today = new Date().toISOString().split('T')[0];
    
    if (period === 'today') {
      const dailyStats = await client.hgetall(`stats:daily:${today}`);
      return {
        period: 'today',
        date: today,
        ...this.parseHashValues(dailyStats)
      };
    } else if (period === 'all') {
      const globalStats = await client.hgetall('stats:global');
      return {
        period: 'all',
        ...this.parseHashValues(globalStats)
      };
    }
    
    // Weekly stats
    const weekStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = await client.hgetall(`stats:daily:${dateStr}`);
      weekStats[dateStr] = this.parseHashValues(dayStats);
    }
    
    return {
      period: 'week',
      stats: weekStats
    };
  }

  async trackEvent(eventType, metadata = {}) {
    const client = await this.getClient();
    const eventId = `event:${eventType}:${Date.now()}`;
    
    const data = JSON.stringify({
      type: eventType,
      ...metadata,
      timestamp: new Date().toISOString()
    });
    
    // Store event
    await client.setex(eventId, 2592000, data); // 30 days
    
    // Add to event stream
    await client.lpush(`events:${eventType}`, eventId);
    await client.ltrim(`events:${eventType}`, 0, 9999); // Keep last 10000
    
    // Update counters
    const today = new Date().toISOString().split('T')[0];
    await client.hincrby(`stats:events:${today}`, eventType, 1);
    
    return eventId;
  }

  // ============================================
  // 8. WEBHOOK DEDUPLICATION
  // ============================================
  
  async isDuplicateWebhook(webhookId, ttlSeconds = 300) {
    const client = await this.getClient();
    const key = `webhook:processed:${webhookId}`;
    
    // Set only if not exists (NX flag)
    const result = await client.set(key, '1', 'NX', 'EX', ttlSeconds);
    
    // null means key existed (duplicate)
    return result === null;
  }

  // ============================================
  // 9. CACHING LAYER
  // ============================================
  
  async cacheSet(key, value, ttlSeconds = 3600) {
    const client = await this.getClient();
    const cacheKey = `cache:${key}`;
    const data = JSON.stringify(value);
    
    if (ttlSeconds > 0) {
      await client.setex(cacheKey, ttlSeconds, data);
    } else {
      await client.set(cacheKey, data);
    }
    
    return true;
  }

  async cacheGet(key) {
    const client = await this.getClient();
    const data = await client.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async cacheDelete(key) {
    const client = await this.getClient();
    return await client.del(`cache:${key}`);
  }

  // ============================================
  // 10. QUEUE MANAGEMENT
  // ============================================
  
  async addToQueue(queueName, taskData) {
    const client = await this.getClient();
    const task = JSON.stringify({
      ...taskData,
      queuedAt: new Date().toISOString()
    });
    
    await client.rpush(`queue:${queueName}`, task);
    return true;
  }

  async getFromQueue(queueName) {
    const client = await this.getClient();
    const task = await client.lpop(`queue:${queueName}`);
    return task ? JSON.parse(task) : null;
  }

  async getQueueLength(queueName) {
    const client = await this.getClient();
    return await client.llen(`queue:${queueName}`);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  
  parseHashValues(hash) {
    const parsed = {};
    for (const [key, value] of Object.entries(hash)) {
      parsed[key] = isNaN(value) ? value : parseInt(value, 10);
    }
    return parsed;
  }

  async cleanup() {
    const client = await this.getClient();
    
    // Clean up old daily stats (keep 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (let i = 31; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      await client.del(`stats:daily:${dateStr}`);
      await client.del(`analytics:comments:${dateStr}`);
      await client.del(`stats:events:${dateStr}`);
    }
    
    console.log('🧹 Redis cleanup completed');
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('👋 Enhanced Redis disconnected');
    }
  }

  // ============================================
  // MIGRATION HELPER
  // ============================================
  
  async migrateFromJSON(jsonData) {
    console.log('🔄 Starting migration from JSON to Redis...');
    
    // Migrate reels automations
    if (jsonData.reels) {
      for (const [reelId, automation] of Object.entries(jsonData.reels)) {
        await this.saveReelAutomation(reelId, automation);
        console.log(`✅ Migrated reel automation: ${reelId}`);
      }
    }
    
    // Migrate replied comments
    if (jsonData.repliedComments) {
      for (const [commentId, replyData] of Object.entries(jsonData.repliedComments)) {
        await this.markCommentAsReplied(commentId, replyData);
        console.log(`✅ Migrated replied comment: ${commentId}`);
      }
    }
    
    console.log('✅ Migration completed successfully');
  }
}

// Create singleton instance
const enhancedRedisClient = new EnhancedRedisClient();

module.exports = enhancedRedisClient;
