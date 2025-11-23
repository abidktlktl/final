// Add immediate console log to verify script is running
console.log('🚀 Starting Fastify server with Redis...');
console.log('📁 Current directory:', __dirname);
console.log('🔧 Node version:', process.version);

const fastify = require('fastify')({ 
  logger: true,
  trustProxy: true 
});
const cors = require('@fastify/cors');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import Enhanced Redis client instead of basic one
const redisClient = require('./redis-enhanced');

// Railway provides PORT environment variable
const PORT = process.env.PORT || 4000;
console.log(`🔍 Using PORT: ${PORT}`);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Initialize Redis connection on startup
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis initialized successfully');
    
    // Migrate existing data if needed
    if (process.env.AUTO_MIGRATE === 'true') {
      const { migrateData } = require('./migrate-to-redis');
      await migrateData();
    }
  } catch (error) {
    console.error('⚠️ Redis connection failed, using fallback:', error.message);
  }
})();

// Register CORS plugin with simplified configuration
fastify.register(cors, {
  origin: true, // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// Health check endpoint with Redis status
fastify.get('/health', async (request, reply) => {
  const redisStatus = redisClient.isConnected ? 'connected' : 'disconnected';
  
  return { 
    status: 'healthy',
    redis: redisStatus,
    timestamp: new Date().toISOString()
  };
});

// Instagram OAuth endpoint with proper permissions
fastify.get('/api/auth/instagram', async (request, reply) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5173/auth/callback';
  
  if (!CLIENT_ID) {
    return reply.code(500).send({ 
      error: 'Instagram Client ID not configured',
      details: 'Please set INSTAGRAM_CLIENT_ID or FACEBOOK_APP_ID in environment variables'
    });
  }
  
  // Request ALL necessary permissions including DM permissions
  const permissions = [
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',  // CRITICAL for DMs
    'pages_show_list',
    'pages_manage_metadata',      // For page management
    'pages_read_engagement',       // For reading page data
    'instagram_content_publish',   // Optional: for posting content
    'instagram_manage_insights'    // Optional: for analytics
  ].join(',');
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${permissions}&` +
    `response_type=code&` +
    `state=${Date.now()}`;  // Add state for security
  
  console.log('🔐 Generated Instagram OAuth URL with permissions:', permissions);
  
  return {
    authUrl,
    permissions: permissions.split(','),
    note: 'Ensure instagram_manage_messages permission is granted for DM functionality'
  };
});

// Check token permissions endpoint
fastify.get('/api/debug/token-permissions', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Check token permissions
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`
    );
    
    const data = await response.json();
    
    // Check token info
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?` +
      `input_token=${token}&` +
      `access_token=${token}`
    );
    
    const debugData = await debugResponse.json();
    
    // Check for critical permissions
    const permissions = data.data || [];
    const hasMessagingPermission = permissions.some(p => 
      p.permission === 'instagram_manage_messages' && p.status === 'granted'
    );
    const hasCommentsPermission = permissions.some(p => 
      p.permission === 'instagram_manage_comments' && p.status === 'granted'
    );
    
    return {
      permissions: permissions,
      tokenInfo: {
        app_id: debugData.data?.app_id,
        type: debugData.data?.type,
        expires_at: debugData.data?.expires_at,
        scopes: debugData.data?.scopes,
        is_valid: debugData.data?.is_valid
      },
      criticalPermissions: {
        hasMessagingPermission,
        hasCommentsPermission,
        missingPermissions: []
      },
      recommendation: !hasMessagingPermission ? 
        'CRITICAL: Missing instagram_manage_messages permission. DMs will not work. Please re-authenticate with proper permissions or submit for App Review.' :
        'All critical permissions granted'
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return reply.code(500).send({ 
      error: 'Failed to check permissions',
      details: error.message 
    });
  }
});

// Quick test endpoint for DM capability
fastify.get('/api/test/can-send-dm', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Quick permission check
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`
    );
    
    const data = await response.json();
    const canSendDM = data.data?.some(p => 
      p.permission === 'instagram_manage_messages' && 
      p.status === 'granted'
    );
    
    return {
      canSendDM,
      message: canSendDM ? 
        '✅ You can send DMs!' : 
        '❌ Missing instagram_manage_messages permission',
      allPermissions: data.data || []
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return reply.code(500).send({ 
      error: 'Failed to check permissions',
      details: error.message 
    });
  }
});

// Test Private Reply API endpoint
fastify.post('/api/test/private-reply', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const { comment_id, message, ig_account_id } = request.body;
  
  if (!comment_id || !message) {
    return reply.code(400).send({ 
      error: 'Missing required fields: comment_id and message' 
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Send Private Reply using the correct API format
    const dmUrl = `https://graph.facebook.com/v18.0/${ig_account_id || 'me'}/messages`;
    
    console.log('🧪 Testing Private Reply API:');
    console.log('   Comment ID:', comment_id);
    console.log('   Message:', message);
    console.log('   IG Account:', ig_account_id || 'me');
    
    const response = await fetch(dmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipient: { 
          comment_id: comment_id  // Using comment_id for Private Reply!
        },
        message: { 
          text: message 
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Private Reply sent successfully!');
      return {
        success: true,
        message: 'Private Reply sent successfully!',
        recipient_id: result.recipient_id,
        message_id: result.message_id,
        api_format: 'Private Reply API (comment_id in recipient)'
      };
    } else {
      console.error('❌ Private Reply failed:', result);
      return reply.code(response.status).send({ 
        error: 'Failed to send Private Reply',
        details: result.error,
        api_format: 'Private Reply API (comment_id in recipient)',
        troubleshooting: {
          check_permissions: 'Ensure instagram_manage_messages permission is granted',
          check_comment_id: 'Verify the comment_id is valid and recent',
          check_account: 'Confirm you own the Instagram Business Account'
        }
      });
    }
  } catch (error) {
    console.error('Error testing Private Reply:', error);
    return reply.code(500).send({ 
      error: 'Failed to test Private Reply',
      details: error.message 
    });
  }
});

// Instagram OAuth callback handler
fastify.post('/api/auth/instagram/callback', async (request, reply) => {
  const { code } = request.body;
  
  if (!code) {
    return reply.code(400).send({ error: 'No authorization code provided' });
  }
  
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5173/auth/callback';
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return reply.code(500).send({ 
      error: 'Instagram credentials not configured',
      details: 'Please set CLIENT_ID and CLIENT_SECRET in environment variables'
    });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${CLIENT_ID}&` +
      `client_secret=${CLIENT_SECRET}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `code=${code}`
    );
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      return reply.code(400).send({ 
        error: 'Failed to exchange code for token',
        details: error.error?.message || 'Unknown error'
      });
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${CLIENT_ID}&` +
      `client_secret=${CLIENT_SECRET}&` +
      `fb_exchange_token=${accessToken}`
    );
    
    let finalToken = accessToken;
    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      finalToken = longLivedData.access_token;
      console.log('✅ Exchanged for long-lived token');
    }
    
    // Get user info and Instagram account
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${finalToken}`
    );
    
    const userData = await userResponse.json();
    
    // Get Instagram Business Account (using the account endpoint)
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${finalToken}`
    );
    
    let instagramInfo = null;
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      // Process Instagram account data if available
      if (accountData.data && accountData.data.length > 0) {
        const page = accountData.data[0];
        const pageToken = page.access_token;
        
        // Get Instagram account connected to the page
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageToken}`
        );
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          if (igData.instagram_business_account) {
            instagramInfo = {
              id: igData.instagram_business_account.id,
              page_id: page.id,
              page_name: page.name,
              page_token: pageToken
            };
            
            // Save to Redis
            const userId = `ig_${igData.instagram_business_account.id}`;
            await redisClient.saveUser(userId, {
              ...instagramInfo,
              facebook_user_id: userData.id,
              name: userData.name,
              email: userData.email
            });
          }
        }
      }
    }
    
    return {
      success: true,
      token: finalToken,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        instagram: instagramInfo
      },
      message: 'Successfully authenticated with Instagram'
    };
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return reply.code(500).send({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Analytics endpoint using Redis
fastify.get('/api/analytics', async (request, reply) => {
  try {
    const { period = 'today' } = request.query;
    const analytics = await redisClient.getAnalytics(period);
    
    return {
      success: true,
      analytics
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return reply.code(500).send({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    });
  }
});

// Check bot token status
fastify.get('/api/bot/status', async (request, reply) => {
  const hasBotToken = !!process.env.INSTAGRAM_BOT_ACCESS_TOKEN;
  const tokenPreview = hasBotToken ?
    process.env.INSTAGRAM_BOT_ACCESS_TOKEN.substring(0, 14) + '...' :
    'Not configured';

  return {
    hasBotToken,
    tokenPreview,
    message: hasBotToken ?
      'Instagram bot token is configured' :
      'Instagram bot token is not configured in .env file'
  };
});

// Get Instagram Business Account ID and Page Token
fastify.get('/api/instagram/account', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const userToken = authHeader.replace('Bearer ', '');
  
  try {
    // Step 1: Get Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}`
    );
    
    if (!pagesResponse.ok) {
      const error = await pagesResponse.json();
      console.error('Failed to get pages:', error);
      return reply.code(400).send({ 
        error: 'Failed to get Facebook pages',
        details: error.error?.message 
      });
    }
    
    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return reply.code(404).send({ 
        error: 'No Facebook pages found. Please connect a Facebook page with Instagram.' 
      });
    }
    
    // Get the first page (or let user select if multiple)
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    
    // Step 2: Get Instagram Business Account connected to the page
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );
    
    if (!igAccountResponse.ok) {
      const error = await igAccountResponse.json();
      console.error('Failed to get Instagram account:', error);
      return reply.code(400).send({ 
        error: 'Failed to get Instagram business account',
        details: error.error?.message 
      });
    }
    
    const igData = await igAccountResponse.json();
    
    if (!igData.instagram_business_account) {
      return reply.code(404).send({ 
        error: 'No Instagram business account connected to this Facebook page' 
      });
    }
    
    const igAccountId = igData.instagram_business_account.id;
    
    // Step 3: Get Instagram account details
    const igDetailsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${pageAccessToken}`
    );
    
    const igDetails = await igDetailsResponse.json();
    
    console.log('✅ Instagram Business Account found:', igDetails.username);
    
    // Save user data to Redis
    const userId = `ig_${igAccountId}`;
    await redisClient.saveUser(userId, {
      instagram_account_id: igAccountId,
      instagram_username: igDetails.username,
      profile_picture_url: igDetails.profile_picture_url,
      followers_count: igDetails.followers_count,
      media_count: igDetails.media_count,
      page_id: pageId,
      page_name: page.name,
      page_token: pageAccessToken
    });
    
    // Create session
    const sessionId = await redisClient.createSession(userId, {
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
    
    return {
      success: true,
      sessionId,
      instagram_business_account: {
        id: igAccountId,
        username: igDetails.username,
        profile_picture_url: igDetails.profile_picture_url,
        followers_count: igDetails.followers_count,
        media_count: igDetails.media_count
      },
      page: {
        id: pageId,
        name: page.name,
        access_token: pageAccessToken // Store this securely
      }
    };
  } catch (error) {
    console.error('Error getting Instagram account:', error);
    return reply.code(500).send({ 
      error: 'Failed to get Instagram account',
      details: error.message 
    });
  }
});

// Real Instagram reels endpoint with caching
fastify.get('/api/reels', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Check cache first
  const cacheKey = `reels:${token.substring(0, 20)}`;
  const cachedReels = await redisClient.cacheGet(cacheKey);
  
  if (cachedReels) {
    console.log('📦 Returning cached reels');
    return cachedReels;
  }
  
  try {
    // Use Instagram Graph API to fetch user media
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username&access_token=${token}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      fastify.log.error('Instagram API error:', error);
      return reply.code(response.status).send({ 
        error: 'Failed to fetch Instagram media',
        details: error.error?.message || 'Unknown error'
      });
    }
    
    const data = await response.json();
    
    // Filter for reels/videos and format the response
    const reels = (data.data || [])
      .filter(item => item.media_type === 'VIDEO' || item.media_type === 'REELS_PLAY')
      .map(item => ({
        id: item.id,
        thumbnail: item.thumbnail_url || item.media_url || '/placeholder.svg',
        caption: item.caption || 'No caption',
        owner: item.username || 'Unknown',
        permalink: item.permalink,
        timestamp: item.timestamp,
        media_url: item.media_url,
        isRealData: true
      }));
    
    // Cache for 5 minutes
    await redisClient.cacheSet(cacheKey, reels, 300);
    
    fastify.log.info(`Fetched ${reels.length} reels from Instagram`);
    return reels;
    
  } catch (error) {
    fastify.log.error('Error fetching Instagram reels:', error);
    
    // Fallback to mock data if real API fails
    const mockReels = [
      {
        id: "r1",
        thumbnail: "/placeholder.svg",
        caption: "3 Halal income tips",
        owner: "mmomin",
        duration: 15,
        isRealData: false
      },
      {
        id: "r2",
        thumbnail: "/placeholder.svg",
        caption: "Side hustle case study",
        owner: "agencyX",
        duration: 30,
        isRealData: false
      },
      {
        id: "r3",
        thumbnail: "/placeholder.svg",
        caption: "Quick money tips",
        owner: "user123",
        duration: 22,
        isRealData: false
      }
    ];
    
    return mockReels;
  }
});

// Send Direct Message with tracking
fastify.post('/api/messages/send', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const { recipient_id, message, ig_account_id, page_token } = request.body;
  
  if (!recipient_id || !message) {
    return reply.code(400).send({ 
      error: 'Missing required fields: recipient_id and message' 
    });
  }
  
  // Check rate limit
  const rateLimit = await redisClient.checkRateLimit(`dm:${ig_account_id}`, 50, 3600);
  if (!rateLimit.allowed) {
    return reply.code(429).send({ 
      error: 'Rate limit exceeded',
      remaining: rateLimit.remaining,
      resetIn: rateLimit.resetIn 
    });
  }
  
  try {
    // Use page token if provided, otherwise extract from auth header
    const accessToken = page_token || authHeader.replace('Bearer ', '');
    
    // Send message using Instagram Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${ig_account_id || 'me'}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipient_id },
          message: { text: message },
          access_token: accessToken
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send message:', error);
      return reply.code(response.status).send({ 
        error: 'Failed to send message',
        details: error.error?.message 
      });
    }
    
    const result = await response.json();
    console.log('✅ Message sent successfully:', result);
    
    // Track DM in Redis
    await redisClient.trackDMSent(ig_account_id, recipient_id, {
      message,
      message_id: result.message_id,
      type: 'manual'
    });
    
    return {
      success: true,
      message_id: result.message_id,
      recipient_id: recipient_id,
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetIn: rateLimit.resetIn
      }
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return reply.code(500).send({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Get all automations from Redis
fastify.get('/api/automation', async (request, reply) => {
  try {
    const userId = request.headers['x-user-id'];
    const automations = await redisClient.getAllReelAutomations(userId);
    
    console.log('📋 Fetched automations:', Object.keys(automations).length, 'reels');
    
    return {
      reels: automations,
      stories: {} // TODO: Implement story automations
    };
  } catch (error) {
    console.error('Error reading automations:', error);
    return reply.code(500).send({ error: 'Failed to load automations' });
  }
});

// Save automation for a specific reel using Redis
fastify.post('/api/automation/reel/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const automationData = request.body;
    const userId = request.headers['x-user-id'];
    
    console.log(`💾 Saving automation for reel ${id}:`, automationData);
    
    // Check daily quota
    const quota = await redisClient.checkDailyQuota(userId, 'automations', 100);
    if (!quota.allowed) {
      return reply.code(429).send({ 
        error: 'Daily automation limit reached',
        remaining: quota.remaining,
        maxQuota: quota.maxQuota 
      });
    }
    
    // Save to Redis
    await redisClient.saveReelAutomation(id, {
      ...automationData,
      userId
    });
    
    // Track event
    await redisClient.trackEvent('automation_created', {
      reelId: id,
      userId
    });
    
    console.log(`✅ Automation saved for reel ${id}`);
    return { 
      success: true, 
      automation: await redisClient.getReelAutomation(id),
      message: 'Automation saved successfully',
      quota: {
        used: quota.used,
        remaining: quota.remaining - 1,
        maxQuota: quota.maxQuota
      }
    };
  } catch (error) {
    console.error('Error saving reel automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to save automation' 
    });
  }
});

// Delete automation for a specific reel using Redis
fastify.delete('/api/automation/reel/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const userId = request.headers['x-user-id'];
    
    console.log(`🗑️ Deleting automation for reel ${id}`);
    
    // Delete from Redis
    await redisClient.deleteReelAutomation(id, userId);
    
    // Track event
    await redisClient.trackEvent('automation_deleted', {
      reelId: id,
      userId
    });
    
    console.log(`✅ Automation deleted for reel ${id}`);
    return { 
      success: true, 
      message: 'Automation deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting reel automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to delete automation' 
    });
  }
});

// Save DM Automation Settings
fastify.post('/api/automation/dm', async (request, reply) => {
  try {
    const automationData = request.body;
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'No token provided' });
    }
    
    // Get Instagram account ID from token/session
    const userId = request.headers['x-user-id'] || 'default';
    const accountId = request.headers['x-ig-account-id'] || userId;
    
    console.log('💾 Saving DM automation settings for account:', accountId);
    
    // Save to Redis
    await redisClient.saveDMAutomation(accountId, automationData);
    
    // Track event
    await redisClient.trackEvent('dm_automation_updated', {
      accountId,
      hasWelcome: !!automationData.welcome_message?.enabled,
      keywordCount: automationData.keyword_responses?.length || 0
    });
    
    console.log('✅ DM automation settings saved');
    return { 
      success: true, 
      dm_automations: automationData,
      message: 'DM automation settings saved successfully' 
    };
  } catch (error) {
    console.error('Error saving DM automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to save DM automation settings' 
    });
  }
});

// Get DM Automation Settings
fastify.get('/api/automation/dm', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'No token provided' });
    }
    
    // Get Instagram account ID from token/session
    const userId = request.headers['x-user-id'] || 'default';
    const accountId = request.headers['x-ig-account-id'] || userId;
    
    const dmAutomation = await redisClient.getDMAutomation(accountId);
    
    return {
      success: true,
      dm_automations: dmAutomation || {
        welcome_message: {
          enabled: false,
          message: '',
          delay: 0
        },
        story_reply: {
          enabled: false,
          message: ''
        },
        keyword_responses: []
      }
    };
  } catch (error) {
    console.error('Error getting DM automation:', error);
    return reply.code(500).send({ 
      error: 'Failed to get DM automation settings' 
    });
  }
});

// Instagram/Facebook Webhook Verification
fastify.get('/webhook/instagram', async (request, reply) => {
  const mode = request.query['hub.mode'];
  const token = request.query['hub.verify_token'];
  const challenge = request.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return reply.type('text/plain').send(challenge);
    } else {
      console.log('❌ Webhook verification failed - token mismatch');
      return reply.code(403).send('Forbidden');
    }
  }
  
  return reply.code(400).send('Bad Request');
});

// Instagram/Facebook Webhook Events Handler with Redis
fastify.post('/webhook/instagram', async (request, reply) => {
  const body = request.body;
  
  // Log incoming webhook events (simplified for production)
  console.log('📨 Webhook received - Type:', body.object, 'Entries:', body.entry?.length || 0);
  
  // Track webhook event
  await redisClient.trackEvent('webhook_received', {
    object: body.object,
    entryCount: body.entry?.length || 0
  });
  
  // Handle different types of webhook events
  if (body.object === 'instagram') {
    // Process Instagram webhook events
    if (body.entry && body.entry.length > 0) {
      // Process each entry asynchronously
      for (const entry of body.entry) {
        // Handle Instagram DM/messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            console.log('📩 New DM event:', JSON.stringify(event, null, 2));
            
            // Handle incoming messages
            if (event.message && !event.message.is_echo) {
              const senderId = event.sender?.id;
              const recipientId = event.recipient?.id;
              const messageText = event.message?.text;
              const messageId = event.message?.mid;
              
              console.log(`💬 DM from ${senderId}: "${messageText}"`);
              console.log(`📬 Message ID: ${messageId}`);
              
              // Check for DM automation
              try {
                // Get DM automation settings from Redis
                const dmAutomation = await redisClient.getDMAutomation(recipientId);
                
                if (dmAutomation) {
                  // Check for keyword responses
                  if (dmAutomation.keyword_responses && messageText) {
                    const lowerMessage = messageText.toLowerCase();
                    
                    for (const keywordResponse of dmAutomation.keyword_responses) {
                      const hasMatch = keywordResponse.keywords?.some(keyword => 
                        lowerMessage.includes(keyword.toLowerCase())
                      );
                      
                      if (hasMatch) {
                        console.log(`🎯 DM keyword match: "${keywordResponse.keywords.join(', ')}"`);
                        
                        // Check rate limit
                        const rateLimit = await redisClient.checkRateLimit(`dm_reply:${senderId}`, 10, 3600);
                        if (!rateLimit.allowed) {
                          console.log(`⚠️ Rate limit exceeded for DM replies to ${senderId}`);
                          break;
                        }
                        
                        if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                          // Send auto-reply DM - access_token must be in URL
                          const response = await fetch(
                            `https://graph.facebook.com/v18.0/${recipientId}/messages?access_token=${process.env.INSTAGRAM_BOT_ACCESS_TOKEN}`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                recipient: { id: senderId },
                                message: { text: keywordResponse.response }
                              })
                            }
                          );
                          
                          if (response.ok) {
                            const result = await response.json();
                            console.log('✅ Auto-DM reply sent successfully');
                            console.log('   Message ID:', result.message_id);
                            
                            // Track DM sent
                            await redisClient.trackDMSent(recipientId, senderId, {
                              message: keywordResponse.response,
                              message_id: result.message_id,
                              type: 'auto_keyword',
                              trigger: keywordResponse.keywords.join(', ')
                            });
                          } else {
                            const error = await response.json();
                            console.error('❌ Failed to send auto-DM:', error);
                          }
                        }
                        break; // Only send one response per message
                      }
                    }
                  }
                  
                  // Check for welcome message (for new conversations)
                  if (dmAutomation.welcome_message?.enabled && !event.prior_message) {
                    console.log('👋 Sending welcome message to new conversation');
                    
                    if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                      // Add delay if configured
                      const delay = dmAutomation.welcome_message.delay || 0;
                      if (delay > 0) {
                        console.log(`⏱️ Waiting ${delay} seconds before sending welcome message`);
                        await new Promise(resolve => setTimeout(resolve, delay * 1000));
                      }
                      
                      const response = await fetch(
                        `https://graph.facebook.com/v18.0/${recipientId}/messages?access_token=${process.env.INSTAGRAM_BOT_ACCESS_TOKEN}`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            recipient: { id: senderId },
                            message: { text: dmAutomation.welcome_message.message }
                          })
                        }
                      );
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Welcome message sent');
                        console.log('   Message ID:', result.message_id);
                        
                        // Track welcome message
                        await redisClient.trackDMSent(recipientId, senderId, {
                          message: dmAutomation.welcome_message.message,
                          message_id: result.message_id,
                          type: 'welcome'
                        });
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('❌ Error processing DM automation:', error);
              }
              
              // Track incoming DM
              await redisClient.trackEvent('dm_received', {
                senderId,
                recipientId,
                messageId,
                hasText: !!messageText
              });
            }
            
            // Handle message delivery/read receipts
            if (event.delivery) {
              console.log('✅ Message delivered:', event.delivery.mids);
            }
            
            if (event.read) {
              console.log('👁️ Message read:', event.read.watermark);
            }
          }
        }
        
        // Handle comments
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments' || change.field === 'live_comments') {
              const commentType = change.field === 'live_comments' ? '🔴 LIVE' : '💬';
              
              const commentId = change.value?.id || change.value?.comment_id;
              const commentText = change.value?.text;
              const fromUser = change.value?.from;
              const mediaId = change.value?.media?.id;
              
              console.log(`${commentType} Comment detected:`, {
                commentId,
                text: commentText,
                from: fromUser?.username,
                mediaId
              });
              
              // Skip if missing required data
              if (!commentId || !commentText || !fromUser) {
                console.log('⚠️ Missing required comment data, skipping...');
                continue;
              }
              
              // Skip if comment is from the bot itself (prevent infinite loop)
              // The entry.id is the Instagram Business Account ID receiving the webhook
              if (fromUser.id === entry.id || fromUser.id === process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
                console.log(`🤖 Skipping bot's own comment from @${fromUser.username} (ID: ${fromUser.id})`);
                continue;
              }
              
              try {
                // Create unique webhook ID for this specific comment
                const webhookId = `webhook_comment_${commentId}`;
                
                // Check for duplicate webhook processing
                const isDuplicate = await redisClient.isDuplicateWebhook(webhookId, 600); // 10 minute TTL
                if (isDuplicate) {
                  console.log(`🔁 Duplicate webhook for comment ${commentId}, skipping...`);
                  continue;
                }
                
                // Also check if already replied (double safety)
                const alreadyReplied = await redisClient.hasCommentBeenReplied(commentId);
                if (alreadyReplied) {
                  console.log(`⏭️ Already replied to comment ${commentId}, skipping...`);
                  continue;
                }
                
                console.log(`📝 Processing comment from @${fromUser.username}: "${commentText}"`);
                console.log(`📍 On media: ${mediaId}`);
                
                // Mark as replied IMMEDIATELY to prevent race conditions
                await redisClient.markCommentAsReplied(commentId, {
                    status: 'processing',
                    mediaId: mediaId,
                    username: fromUser.username,
                    timestamp: new Date().toISOString()
                  });
                  
                // Get automation from Redis
                const automation = await redisClient.getReelAutomation(mediaId);
                  
                  if (automation && automation.comment) {
                    console.log(`🤖 Found automation for media ${mediaId}`);
                    console.log('📋 Automation data:', JSON.stringify(automation, null, 2));
                    
                    // Check daily limit if configured
                    const dailyLimit = automation.dailyLimit || 100;
                    const dailyKey = `daily_limit:${mediaId}:${new Date().toISOString().split('T')[0]}`;
                    const dailyCount = await redisClient.checkDailyQuota('', dailyKey, dailyLimit);
                    if (!dailyCount.allowed) {
                      console.log(`⚠️ Daily limit (${dailyLimit}) reached for media ${mediaId}`);
                      continue;
                    }
                    
                    // Check rate limit for auto-replies
                    const rateLimit = await redisClient.checkRateLimit(`reply:${mediaId}`, 20, 3600);
                    if (!rateLimit.allowed) {
                      console.log(`⚠️ Rate limit exceeded for media ${mediaId}`);
                      continue;
                    }
                    
                    // Apply response delay if configured
                    const responseDelay = automation.responseDelay || 0;
                    if (responseDelay > 0) {
                      console.log(`⏱️ Applying ${responseDelay} second delay before replying...`);
                      await new Promise(resolve => setTimeout(resolve, responseDelay * 1000));
                    }
                    
                    if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                      // Send auto-reply
                      const replyMessage = automation.comment
                        .replace('{username}', fromUser.username)
                        .replace('{user}', fromUser.username);
                      
                      console.log(`💬 Sending auto-reply: "${replyMessage}"`);
                      
                      // Send reply using Instagram Graph API - access_token must be in URL
                      const replyUrl = `https://graph.facebook.com/v18.0/${commentId}/replies?access_token=${process.env.INSTAGRAM_BOT_ACCESS_TOKEN}`;
                      const response = await fetch(replyUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          message: replyMessage
                        })
                      });
                      
                      const result = await response.json();
                      
                      if (response.ok && result.id) {
                        console.log('✅ Auto-reply sent successfully!');
                        console.log('   Reply ID:', result.id);
                        console.log('   To comment:', commentId);
                        
                        // Update the reply status with the actual reply ID
                        await redisClient.markCommentAsReplied(commentId, {
                          status: 'completed',
                          replyId: result.id,
                          message: replyMessage,
                          mediaId: mediaId,
                          username: fromUser.username,
                          timestamp: new Date().toISOString()
                        });
                        
                        // Track event
                        await redisClient.trackEvent('comment_replied', {
                          commentId,
                          mediaId,
                          username: fromUser.username
                        });
                        
                        // SEND AUTO DM WHEN COMMENT IS RECEIVED
                        console.log('🔍 Checking auto DM settings:', {
                          autoDmOnComment: automation.autoDmOnComment,
                          hasFromUserId: !!fromUser.id,
                          fromUserId: fromUser.id,
                          fromUsername: fromUser.username
                        });
                        
                        if (automation.autoDmOnComment && fromUser.id) {
                          console.log(`📨 Sending auto DM (Private Reply) to @${fromUser.username} after comment`);
                          
                          // Apply DM delay if configured
                          const dmDelay = automation.dmOnCommentDelay || 5;
                          if (dmDelay > 0) {
                            console.log(`⏱️ Waiting ${dmDelay} seconds before sending DM...`);
                            await new Promise(resolve => setTimeout(resolve, dmDelay * 1000));
                          }
                          
                          // Check rate limit for Private Replies (750 per hour for posts/reels)
                          const dmRateLimit = await redisClient.checkRateLimit(`private_reply:${entry.id}`, 750, 3600);
                          if (!dmRateLimit.allowed) {
                            console.log(`⚠️ Private Reply rate limit exceeded (750/hour)`);
                          } else {
                            // Prepare DM message
                            const dmMessage = (automation.dmOnCommentMessage || 
                              "Thanks for commenting! 💬 Check out our exclusive content and special offers!")
                              .replace('{username}', fromUser.username)
                              .replace('{user}', fromUser.username);
                            
                            // Get the Page Access Token from Redis for this Instagram account
                            const userId = `ig_${entry.id}`;
                            const userData = await redisClient.getUser(userId);
                            const pageAccessToken = userData?.page_token || process.env.INSTAGRAM_BOT_ACCESS_TOKEN;
                            
                            if (!pageAccessToken) {
                              console.error('❌ No Page Access Token available for sending Private Reply');
                              console.error('   Please authenticate with Instagram to get a Page Access Token');
                              continue;
                            }
                            
                            // Check token permissions before attempting to send
                            console.log('🔐 Checking token permissions for Private Reply...');
                            try {
                              const permCheck = await fetch(
                                `https://graph.facebook.com/v18.0/me/permissions?access_token=${pageAccessToken}`
                              );
                              const permData = await permCheck.json();
                              const hasMessaging = permData.data?.some(p => 
                                p.permission === 'instagram_manage_messages' && 
                                p.status === 'granted'
                              );
                              
                              if (!hasMessaging) {
                                console.error('❌ Token lacks instagram_manage_messages permission');
                                console.error('   This permission is required for Private Reply API');
                                console.error('   Solutions:');
                                console.error('   1. Submit app for Facebook App Review');
                                console.error('   2. Request instagram_manage_messages permission');
                                console.error('   3. Re-authenticate with proper permissions');
                                continue;
                              }
                              console.log('✅ Token has instagram_manage_messages permission');
                            } catch (permError) {
                              console.error('⚠️ Could not verify token permissions:', permError.message);
                              // Continue anyway - let the API call fail if permissions are missing
                            }
                            
                            console.log('📄 Using Page Access Token for Private Reply');
                            console.log('🆔 Instagram Business Account ID:', entry.id);
                            console.log('💬 Comment ID for Private Reply:', commentId);
                            
                            // Send Private Reply using Instagram Private Reply API
                            // IMPORTANT: Use comment_id in recipient, not user id!
                            const dmUrl = `https://graph.facebook.com/v18.0/${entry.id}/messages?access_token=${pageAccessToken}`;
                            const dmResponse = await fetch(dmUrl, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                recipient: { 
                                  comment_id: commentId  // Use comment_id for Private Reply API!
                                },
                                message: { text: dmMessage }
                              })
                            });
                            
                            if (dmResponse.ok) {
                              const dmResult = await dmResponse.json();
                              console.log('✅ Auto DM sent successfully after comment!');
                              console.log('   DM ID:', dmResult.message_id);
                              console.log('   To user:', fromUser.username);
                              
                              // Track DM sent
                              await redisClient.trackDMSent(entry.id, fromUser.id, {
                                message: dmMessage,
                                message_id: dmResult.message_id,
                                type: 'auto_comment_dm',
                                trigger: 'comment_on_reel',
                                mediaId: mediaId
                              });
                              
                              // Track event
                              await redisClient.trackEvent('dm_sent_on_comment', {
                                commentId,
                                mediaId,
                                username: fromUser.username,
                                dmId: dmResult.message_id
                              });
                            } else {
                              const dmError = await dmResponse.json();
                              console.error('❌ Failed to send auto DM after comment');
                              console.error('   Error details:', JSON.stringify(dmError, null, 2));
                              
                              // Provide specific guidance based on error
                              if (dmError.error?.code === 3) {
                                console.error('📋 Permission Error - Solutions:');
                                console.error('   1. Check token permissions: cd backend && node check-token-permissions.js');
                                console.error('   2. Re-authenticate with Instagram to get proper Page Access Token');
                                console.error('   3. Submit app for App Review with instagram_manage_messages');
                              } else if (dmError.error?.code === 190) {
                                console.error('🔑 Token Error - Token may be expired or invalid');
                                console.error('   Re-authenticate with Instagram to get a new token');
                              } else if (dmError.error?.code === 100) {
                                console.error('📝 API Parameter Error - Check comment_id format');
                              }
                            }
                          }
                        }
                      } else {
                        console.error('❌ Failed to send auto-reply');
                        console.error('   Status:', response.status);
                        console.error('   Response:', JSON.stringify(result, null, 2));
                        
                        // Still mark as replied to avoid retrying failed comments
                        if (response.status === 200 || response.status === 201) {
                          console.log('📝 Marking as replied despite missing ID');
                          await redisClient.markCommentAsReplied(commentId, {
                            replyId: 'unknown',
                            message: replyMessage,
                            mediaId: mediaId,
                            username: fromUser.username,
                            note: 'Reply sent but no ID returned'
                          });
                        }
                      }
                    }
                  } else {
                    console.log(`ℹ️ No automation set for media ${mediaId}`);
                  }
                } catch (error) {
                  console.error('❌ Error processing comment:', error);
                }
            }
          }
        }
      }
    }
    
    return reply.code(200).send('EVENT_RECEIVED');
  }
  
  return reply.code(404).send('Not Found');
});

// Dynamic token update endpoint
fastify.post('/api/admin/update-token', async (request, reply) => {
  const { token, adminKey } = request.body;
  
  if (adminKey !== 'your-secret-admin-key-2024') {
    return reply.code(403).send({ error: 'Unauthorized' });
  }
  
  if (!token) {
    return reply.code(400).send({ error: 'Token required' });
  }
  
  process.env.INSTAGRAM_BOT_ACCESS_TOKEN = token;
  
  console.log('✅ Token updated in memory without restart!');
  console.log('New token preview:', token.substring(0, 10) + '...');
  
  return {
    success: true,
    message: 'Token updated successfully',
    tokenPreview: token.substring(0, 10) + '...'
  };
});

// Cleanup endpoint for maintenance
fastify.post('/api/admin/cleanup', async (request, reply) => {
  const { adminKey } = request.body;
  
  if (adminKey !== 'your-secret-admin-key-2024') {
    return reply.code(403).send({ error: 'Unauthorized' });
  }
  
  try {
    await redisClient.cleanup();
    return {
      success: true,
      message: 'Cleanup completed successfully'
    };
  } catch (error) {
    return reply.code(500).send({ 
      error: 'Cleanup failed',
      details: error.message 
    });
  }
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await redisClient.disconnect();
  await fastify.close();
  process.exit(0);
});

// Start server
const start = async () => {
  try {
    const port = parseInt(PORT, 10);
    await fastify.listen({ 
      port: port, 
      host: '0.0.0.0'
    });
    console.log(`🚀 InstaAuto Backend (Fastify + Redis) running on port ${port}`);
    console.log('✅ CORS configured for all origins (temporary for debugging)');
    console.log(`📡 Server is listening on all interfaces (0.0.0.0:${port})`);
    console.log('🔴 Redis status:', redisClient.isConnected ? 'Connected' : 'Disconnected');
  } catch (err) {
    fastify.log.error(err);
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = fastify;
