const Redis = require('ioredis');

// Redis connection configuration
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use Railway Redis URL if available, otherwise use local Redis
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL || 'redis://localhost:6379';
      
      console.log('🔗 Connecting to Redis...');
      
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
        // Railway Redis specific settings
        tls: process.env.REDIS_URL ? {
          rejectUnauthorized: false
        } : undefined
      });

      // Handle connection events
      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      // Test the connection
      await this.client.ping();
      this.isConnected = true;
      
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      console.log('⚠️ Falling back to in-memory tracking (not recommended for production)');
      
      // Return a mock client for development/fallback
      return this.createMockClient();
    }
  }

  // Create a mock Redis client for fallback (uses in-memory Map)
  createMockClient() {
    const memoryStore = new Map();
    const expiryStore = new Map();
    
    return {
      async get(key) {
        // Check if key has expired
        if (expiryStore.has(key)) {
          const expiry = expiryStore.get(key);
          if (Date.now() > expiry) {
            memoryStore.delete(key);
            expiryStore.delete(key);
            return null;
          }
        }
        return memoryStore.get(key) || null;
      },
      
      async set(key, value) {
        memoryStore.set(key, value);
        return 'OK';
      },
      
      async setex(key, seconds, value) {
        memoryStore.set(key, value);
        expiryStore.set(key, Date.now() + (seconds * 1000));
        return 'OK';
      },
      
      async exists(key) {
        // Check expiry first
        if (expiryStore.has(key)) {
          const expiry = expiryStore.get(key);
          if (Date.now() > expiry) {
            memoryStore.delete(key);
            expiryStore.delete(key);
            return 0;
          }
        }
        return memoryStore.has(key) ? 1 : 0;
      },
      
      async del(key) {
        memoryStore.delete(key);
        expiryStore.delete(key);
        return 1;
      },
      
      async expire(key, seconds) {
        if (memoryStore.has(key)) {
          expiryStore.set(key, Date.now() + (seconds * 1000));
          return 1;
        }
        return 0;
      },
      
      async ping() {
        return 'PONG';
      },
      
      async flushall() {
        memoryStore.clear();
        expiryStore.clear();
        return 'OK';
      }
    };
  }

  async getClient() {
    if (!this.client) {
      await this.connect();
    }
    return this.client;
  }

  // Helper methods for comment tracking
  async markCommentAsReplied(commentId, replyData = {}) {
    const client = await this.getClient();
    const key = `comment:replied:${commentId}`;
    const data = JSON.stringify({
      ...replyData,
      repliedAt: new Date().toISOString()
    });
    
    // Store with 7 days expiry (604800 seconds)
    await client.setex(key, 604800, data);
    
    // Also add to a daily set for analytics
    const today = new Date().toISOString().split('T')[0];
    await client.sadd(`comments:replied:${today}`, commentId);
    await client.expire(`comments:replied:${today}`, 86400 * 30); // Keep for 30 days
    
    return true;
  }

  async hasCommentBeenReplied(commentId) {
    const client = await this.getClient();
    const key = `comment:replied:${commentId}`;
    const exists = await client.exists(key);
    return exists === 1;
  }

  async getReplyData(commentId) {
    const client = await this.getClient();
    const key = `comment:replied:${commentId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Rate limiting for webhooks
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
      resetIn: await client.ttl(key)
    };
  }

  // Webhook deduplication
  async isDuplicateWebhook(webhookId, ttlSeconds = 300) {
    const client = await this.getClient();
    const key = `webhook:processed:${webhookId}`;
    
    // Try to set the key only if it doesn't exist
    const result = await client.set(key, '1', 'NX', 'EX', ttlSeconds);
    
    // If result is null, the key already existed (duplicate webhook)
    return result === null;
  }

  // Clean up old data
  async cleanup() {
    const client = await this.getClient();
    // This would be called periodically to clean up old data
    // For now, we rely on Redis TTL for automatic cleanup
    console.log('🧹 Redis cleanup completed (TTL-based)');
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('👋 Redis disconnected');
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;
