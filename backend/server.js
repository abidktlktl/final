// Add immediate console log to verify script is running
console.log('🚀 Starting Fastify server...');
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

// Import Redis client for comment deduplication
const redisClient = require('./redis-client');

// Railway provides PORT environment variable
const PORT = process.env.PORT || 4000;
console.log(`🔍 Using PORT: ${PORT}`);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

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

// Alternative: Use specific origins (uncomment if needed)
/*
fastify.register(cors, {
  origin: [
    
    'https://dm2comment.netlify.app',
    'https://fastify-production-ebef.up.railway.app'
  ],

  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
});
*/

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  };
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
    
    return {
      success: true,
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

// Real Instagram reels endpoint
fastify.get('/api/reels', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  // Extract token from "Bearer TOKEN" format
  const token = authHeader.replace('Bearer ', '');
  
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

// Real Instagram stories endpoint
fastify.get('/api/stories', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  // Extract token from "Bearer TOKEN" format
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Instagram Graph API doesn't directly support stories in the same way
    // We'll fetch recent media and filter for stories if available
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username&limit=10&access_token=${token}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      fastify.log.error('Instagram API error:', error);
      return reply.code(response.status).send({ 
        error: 'Failed to fetch Instagram stories',
        details: error.error?.message || 'Unknown error'
      });
    }
    
    const data = await response.json();
    
    // Format stories from recent media (stories are typically IMAGE or VIDEO within 24 hours)
    const now = new Date();
    const stories = (data.data || [])
      .filter(item => {
        const itemDate = new Date(item.timestamp);
        const hoursDiff = (now - itemDate) / (1000 * 60 * 60);
        return hoursDiff <= 24; // Only items from last 24 hours
      })
      .map(item => ({
        id: item.id,
        thumbnail: item.thumbnail_url || item.media_url || '/placeholder.svg',
        caption: item.caption || 'No caption',
        owner: item.username || 'Unknown',
        expires_at: new Date(new Date(item.timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        permalink: item.permalink,
        media_url: item.media_url,
        isRealData: true
      }));
    
    fastify.log.info(`Fetched ${stories.length} stories from Instagram`);
    return stories;
    
  } catch (error) {
    fastify.log.error('Error fetching Instagram stories:', error);
    
    // Fallback to mock data
    const mockStories = [
      {
        id: "s1",
        thumbnail: "/placeholder.svg",
        caption: "Sale now live",
        owner: "brandX",
        expires_at: "2025-12-01T00:00:00Z",
        isRealData: false
      },
      {
        id: "s2",
        thumbnail: "/placeholder.svg",
        caption: "Launch today",
        owner: "startup",
        expires_at: "2025-09-30T12:00:00Z",
        isRealData: false
      }
    ];
    
    return mockStories;
  }
});

// DM AUTOMATION ENDPOINTS

// Send Direct Message
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
    
    return {
      success: true,
      message_id: result.message_id,
      recipient_id: recipient_id
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return reply.code(500).send({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Get Conversations
fastify.get('/api/messages/conversations', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const { ig_account_id, page_token } = request.query;
  const accessToken = page_token || authHeader.replace('Bearer ', '');
  
  try {
    // Get conversations from Instagram Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${ig_account_id || 'me'}/conversations?fields=id,updated_time,messages{message,from,created_time}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to get conversations:', error);
      return reply.code(response.status).send({ 
        error: 'Failed to get conversations',
        details: error.error?.message 
      });
    }
    
    const data = await response.json();
    console.log(`📬 Fetched ${data.data?.length || 0} conversations`);
    
    return {
      success: true,
      conversations: data.data || [],
      paging: data.paging
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return reply.code(500).send({ 
      error: 'Failed to get conversations',
      details: error.message 
    });
  }
});

// Get Messages in a Thread
fastify.get('/api/messages/thread/:thread_id', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  const { thread_id } = request.params;
  const { page_token } = request.query;
  const accessToken = page_token || authHeader.replace('Bearer ', '');
  
  try {
    // Get messages from a specific thread
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${thread_id}/messages?fields=message,from,created_time,attachments&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to get thread messages:', error);
      return reply.code(response.status).send({ 
        error: 'Failed to get thread messages',
        details: error.error?.message 
      });
    }
    
    const data = await response.json();
    console.log(`💬 Fetched ${data.data?.length || 0} messages from thread`);
    
    return {
      success: true,
      thread_id: thread_id,
      messages: data.data || [],
      paging: data.paging
    };
  } catch (error) {
    console.error('Error getting thread messages:', error);
    return reply.code(500).send({ 
      error: 'Failed to get thread messages',
      details: error.message 
    });
  }
});

// Save DM Automation Settings
fastify.post('/api/automation/dm', async (request, reply) => {
  try {
    const automationData = request.body;
    
    console.log('💾 Saving DM automation settings:', automationData);
    
    // Read current automations
    const automations = await readAutomations();
    
    // Initialize dm_automations if it doesn't exist
    if (!automations.dm_automations) {
      automations.dm_automations = {};
    }
    
    // Update DM automation settings
    automations.dm_automations = {
      ...automations.dm_automations,
      ...automationData,
      updatedAt: new Date().toISOString()
    };
    
    // Save back to file
    await saveAutomations(automations);
    
    console.log('✅ DM automation settings saved');
    return { 
      success: true, 
      dm_automations: automations.dm_automations,
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
    const automations = await readAutomations();
    
    return {
      success: true,
      dm_automations: automations.dm_automations || {
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
  
  // Check if this is a webhook verification request
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('✅ Webhook verified successfully');
      return reply.type('text/plain').send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      console.log('❌ Webhook verification failed - token mismatch');
      return reply.code(403).send('Forbidden');
    }
  }
  
  return reply.code(400).send('Bad Request');
});

// Helper function to check if user follows the account
async function checkIfUserFollows(userId, igAccountId, pageToken) {
  try {
    console.log(`🔍 Checking if user ${userId} follows account ${igAccountId}`);
    
    // Use Instagram Graph API to check follower status
    const followersUrl = `https://graph.facebook.com/v18.0/${igAccountId}/insights?metric=follower_count&access_token=${pageToken}`;
    
    // Alternative approach: Check if we can see the user's follow status
    const userUrl = `https://graph.facebook.com/v18.0/${userId}?fields=id,username,follows&access_token=${pageToken}`;
    
    const response = await fetch(userUrl);
    
    if (response.ok) {
      const data = await response.json();
      // Check if user follows (this field may not always be available due to privacy)
      return data.follows === true;
    }
    
    // Fallback: assume not following if we can't determine
    console.log('⚠️ Could not determine follow status, assuming not following');
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false; // Default to not following on error
  }
}

// Helper function to send DM with conditional content
async function sendConditionalDM(userId, igAccountId, pageToken, isFollower) {
  try {
    // Read automations to get DM templates
    const automations = await readAutomations();
    const dmSettings = automations.dm_automations || {};
    
    let message;
    let includeFollowButton = false;
    
    if (isFollower) {
      // User is a follower - send welcome message with exclusive content
      message = dmSettings.follower_message || "Thanks for being a follower! 🎉 Here's your exclusive content: [link]";
      console.log('✅ User is a follower - sending exclusive content');
    } else {
      // User is not a follower - send follow invitation
      message = dmSettings.non_follower_message || "Thanks for your interest! 👋 Follow us for exclusive content and updates!";
      includeFollowButton = true;
      console.log('📣 User is not a follower - sending follow invitation');
    }
    
    // Prepare message payload
    const messagePayload = {
      recipient: { id: userId },
      message: { 
        text: message
      },
      access_token: pageToken
    };
    
    // Add CTA button for non-followers
    if (includeFollowButton) {
      messagePayload.message.quick_replies = [
        {
          content_type: "text",
          title: "Follow Us 👆",
          payload: "FOLLOW_ACCOUNT"
        }
      ];
    }
    
    // Send the DM
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Conditional DM sent successfully to ${userId}`);
      return result;
    } else {
      const error = await response.json();
      console.error('❌ Failed to send conditional DM:', error);
      return null;
    }
  } catch (error) {
    console.error('Error sending conditional DM:', error);
    return null;
  }
}

// Instagram/Facebook Webhook Events Handler
fastify.post('/webhook/instagram', async (request, reply) => {
  const body = request.body;
  
  // Log incoming webhook events
  console.log('📨 Webhook event received:', JSON.stringify(body, null, 2));
  
  // Handle different types of webhook events
  if (body.object === 'instagram') {
    // Process Instagram webhook events
    if (body.entry && body.entry.length > 0) {
      // Process each entry asynchronously
      for (const entry of body.entry) {
        // Handle messages
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message) {
              console.log('📩 New message:', event.message);
              
              // Check for DM automation
              try {
                const automations = await readAutomations();
                const dmAutomation = automations.dm_automations;
                
                if (dmAutomation && dmAutomation.keyword_responses) {
                  const messageText = event.message.text?.toLowerCase() || '';
                  
                  // Check for keyword matches
                  for (const keywordResponse of dmAutomation.keyword_responses) {
                    const keywords = keywordResponse.keywords || [];
                    const hasMatch = keywords.some(keyword => 
                      messageText.includes(keyword.toLowerCase())
                    );
                    
                    if (hasMatch) {
                      console.log(`🎯 Keyword match found: "${keywords.join(', ')}"`);
                      
                      // Send auto-reply if we have a page token
                      if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                        const response = await fetch(
                          `https://graph.facebook.com/v18.0/me/messages`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              recipient: { id: event.sender.id },
                              message: { text: keywordResponse.response },
                              access_token: process.env.INSTAGRAM_BOT_ACCESS_TOKEN
                            })
                          }
                        );
                        
                        if (response.ok) {
                          console.log('✅ Auto-DM sent successfully');
                        } else {
                          const error = await response.json();
                          console.error('❌ Failed to send auto-DM:', error);
                        }
                      }
                      break; // Stop after first match
                    }
                  }
                }
              } catch (error) {
                console.error('❌ Error processing DM automation:', error);
              }
            }
            
            if (event.postback) {
              console.log('🔄 Postback:', event.postback);
              // Handle postback
            }
          }
        }
        
        // Handle Instagram-specific message events
        if (entry.changes) {
          for (const change of entry.changes) {
            // Handle messages field for Instagram DMs
            if (change.field === 'messages') {
              console.log('💬 Instagram DM event:', change.value);
              
              if (change.value && change.value.message) {
                const messageData = change.value;
                const senderId = messageData.sender?.id;
                const messageText = messageData.message?.text;
                
                console.log(`📨 DM from user ${senderId}: "${messageText}"`);
                
                // Check for DM automation
                try {
                  const automations = await readAutomations();
                  const dmAutomation = automations.dm_automations;
                  
                  // Check for welcome message (for new conversations)
                  if (dmAutomation?.welcome_message?.enabled && messageData.is_echo === false) {
                    console.log('👋 Sending welcome message');
                    
                    if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                      setTimeout(async () => {
                        const response = await fetch(
                          `https://graph.facebook.com/v18.0/me/messages`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              recipient: { id: senderId },
                              message: { text: dmAutomation.welcome_message.message },
                              access_token: process.env.INSTAGRAM_BOT_ACCESS_TOKEN
                            })
                          }
                        );
                        
                        if (response.ok) {
                          console.log('✅ Welcome message sent');
                        }
                      }, (dmAutomation.welcome_message.delay || 0) * 1000);
                    }
                  }
                  
                  // Check for keyword responses
                  if (dmAutomation?.keyword_responses && messageText) {
                    const lowerMessage = messageText.toLowerCase();
                    
                    for (const keywordResponse of dmAutomation.keyword_responses) {
                      const hasMatch = keywordResponse.keywords?.some(keyword => 
                        lowerMessage.includes(keyword.toLowerCase())
                      );
                      
                      if (hasMatch) {
                        console.log(`🎯 DM keyword match: "${keywordResponse.keywords.join(', ')}"`);
                        
                        if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                          const response = await fetch(
                            `https://graph.facebook.com/v18.0/me/messages`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                recipient: { id: senderId },
                                message: { text: keywordResponse.response },
                                access_token: process.env.INSTAGRAM_BOT_ACCESS_TOKEN
                              })
                            }
                          );
                          
                          if (response.ok) {
                            console.log('✅ Keyword auto-reply sent');
                          }
                        }
                        break;
                      }
                    }
                  }
                } catch (error) {
                  console.error('❌ Error processing Instagram DM automation:', error);
                }
              }
            }
          }
        }
        
// Handle comments (both regular and live comments)
        if (entry.changes) {
          for (const change of entry.changes) {
            // Handle both 'comments' and 'live_comments' fields
            if (change.field === 'comments' || change.field === 'live_comments') {
              const commentType = change.field === 'live_comments' ? '🔴 LIVE' : '💬';
              console.log(`${commentType} New comment:`, JSON.stringify(change.value, null, 2));
              
              // Handle different payload structures from Instagram
              // According to Facebook docs, comment_id is the field name
              const commentId = change.value.comment_id || change.value.id;
              const commentText = change.value.text;
              const fromUser = change.value.from;
              const mediaId = change.value.media?.id;
              
              // Auto-reply to comment
              if (commentId && commentText) {
                
                console.log(`📝 Comment from @${fromUser.username}: "${commentText}"`);
                console.log(`📍 On media: ${mediaId}`);
                
                // Read automations to check if this media has automation set
                try {
                  const automations = await readAutomations();
                  const hasAutomation = automations.reels[mediaId];
                  
                  if (hasAutomation && hasAutomation.comment) {
                    console.log(`🤖 Found automation for media ${mediaId}`);
                    
                    // REDIS DUPLICATE PREVENTION: Check if we've already replied to this comment
                    const alreadyReplied = await redisClient.hasCommentBeenReplied(commentId);
                    if (alreadyReplied) {
                      console.log(`⏭️ Already replied to comment ${commentId} (Redis), skipping...`);
                      continue; // Skip to next change/comment
                    }
                    
                    // WEBHOOK DEDUPLICATION: Check if this webhook was already processed
                    const webhookId = `${commentId}_${Date.now()}`;
                    const isDuplicate = await redisClient.isDuplicateWebhook(webhookId);
                    if (isDuplicate) {
                      console.log(`🔁 Duplicate webhook for comment ${commentId}, skipping...`);
                      continue;
                    }
                    
                    // Check if we have a bot token to reply with
                    if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
                      // IMMEDIATE MARKING: Mark as processing to prevent concurrent duplicates
                      automations.repliedComments[commentId] = {
                        repliedAt: new Date().toISOString(),
                        status: 'processing'
                      };
                      await saveAutomations(automations);
                      
                      try {
                        // First, check if there are already replies to this comment
                        const checkUrl = `https://graph.facebook.com/v18.0/${commentId}?fields=replies&access_token=${process.env.INSTAGRAM_BOT_ACCESS_TOKEN}`;
                        const checkResponse = await fetch(checkUrl);
                        
                        if (checkResponse.ok) {
                          const checkData = await checkResponse.json();
                          // If there are already replies, skip
                          if (checkData.replies && checkData.replies.data && checkData.replies.data.length > 0) {
                            console.log(`⚠️ Comment ${commentId} already has ${checkData.replies.data.length} replies, skipping...`);
                            // Update status to skipped
                            automations.repliedComments[commentId] = {
                              repliedAt: new Date().toISOString(),
                              status: 'skipped',
                              reason: 'already_has_replies'
                            };
                            await saveAutomations(automations);
                            continue; // Skip to next change/comment
                          }
                        }
                        
                        // Add a small delay to prevent rapid-fire replies
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Use the custom message from automation or default
                        const replyMessage = hasAutomation.comment
                          .replace('{username}', fromUser.username)
                          .replace('{user}', fromUser.username)
                          .replace('@{username}', `@${fromUser.username}`)
                          .replace('@{user}', `@${fromUser.username}`);
                        
                        console.log(`💬 Sending auto-reply: "${replyMessage}"`);
                        
                        // CONDITIONAL DM: Check follow status and send appropriate DM
                        if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN && fromUser.id) {
                          // Check if user follows the account
                          const isFollower = await checkIfUserFollows(
                            fromUser.id, 
                            mediaId, // Assuming this is the IG account ID
                            process.env.INSTAGRAM_BOT_ACCESS_TOKEN
                          );
                          
                          // Send conditional DM based on follow status
                          await sendConditionalDM(
                            fromUser.id,
                            mediaId,
                            process.env.INSTAGRAM_BOT_ACCESS_TOKEN,
                            isFollower
                          );
                        }
                        
                        // Send reply using Instagram Graph API
                        const replyUrl = `https://graph.facebook.com/v18.0/${commentId}/replies`;
                        const response = await fetch(replyUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            message: replyMessage,
                            access_token: process.env.INSTAGRAM_BOT_ACCESS_TOKEN
                          })
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('✅ Auto-reply sent successfully:', result);
                          
                          // Mark as replied in Redis (persistent tracking)
                          await redisClient.markCommentAsReplied(commentId, {
                            replyId: result.id,
                            message: replyMessage,
                            mediaId: mediaId,
                            username: fromUser.username
                          });
                          
                          console.log(`✅ Comment ${commentId} marked as replied in Redis`);
                        } else {
                          const error = await response.json();
                          console.error('❌ Failed to send auto-reply:', error);
                          
                          // If error indicates duplicate or already replied, mark as completed in Redis
                          if (error.error && error.error.message && 
                              (error.error.message.includes('duplicate') || 
                               error.error.message.includes('already') ||
                               error.error.message.includes('replied'))) {
                            console.log('📝 Marking as replied in Redis due to API error indicating duplicate');
                            await redisClient.markCommentAsReplied(commentId, {
                              status: 'error_duplicate',
                              error: error.error.message,
                              mediaId: mediaId,
                              username: fromUser.username
                            });
                          }
                        }
                      } catch (error) {
                        console.error('❌ Error sending auto-reply:', error);
                        // Remove from tracking to allow retry
                        delete automations.repliedComments[commentId];
                        await saveAutomations(automations);
                      }
                    } else {
                      console.log('⚠️ No bot token configured for auto-reply');
                    }
                  } else {
                    console.log(`ℹ️ No automation set for media ${mediaId}`);
                  }
                } catch (error) {
                  console.error('❌ Error checking automations:', error);
                }
              }
            }
          }
        }
      }
    }
    
    // Return 200 OK to acknowledge receipt of the event
    return reply.code(200).send('EVENT_RECEIVED');
  }
  
  // Return 404 if event is not from Instagram
  return reply.code(404).send('Not Found');
});

// Helper functions for file operations
const AUTOMATIONS_FILE = path.join(__dirname, 'data', 'automations.json');

// Function to read automations from file
async function readAutomations() {
  try {
    const data = await fs.readFile(AUTOMATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Creating new automations file...');
    const defaultData = { reels: {}, stories: {} };
    await saveAutomations(defaultData);
    return defaultData;
  }
}

async function saveAutomations(data) {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write the file
    await fs.writeFile(AUTOMATIONS_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Automations saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving automations:', error);
    throw error;
  }
}

// Get all automations
fastify.get('/api/automation', async (request, reply) => {
  try {
    const automations = await readAutomations();
    console.log('📋 Fetched automations:', Object.keys(automations.reels).length, 'reels,', Object.keys(automations.stories).length, 'stories');
    return automations;
  } catch (error) {
    console.error('Error reading automations:', error);
    return reply.code(500).send({ error: 'Failed to load automations' });
  }
});

// Save automation for a specific reel
fastify.post('/api/automation/reel/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const automationData = request.body;
    
    console.log(`💾 Saving automation for reel ${id}:`, automationData);
    
    // Read current automations
    const automations = await readAutomations();
    
    // Update the specific reel automation
    automations.reels[id] = {
      ...automationData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: automations.reels[id]?.createdAt || new Date().toISOString()
    };
    
    // Save back to file
    await saveAutomations(automations);
    
    console.log(`✅ Automation saved for reel ${id}`);
    return { 
      success: true, 
      automation: automations.reels[id],
      message: 'Automation saved successfully' 
    };
  } catch (error) {
    console.error('Error saving reel automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to save automation' 
    });
  }
});

// Save automation for a specific story
fastify.post('/api/automation/story/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const automationData = request.body;
    
    console.log(`💾 Saving automation for story ${id}:`, automationData);
    
    // Read current automations
    const automations = await readAutomations();
    
    // Update the specific story automation
    automations.stories[id] = {
      ...automationData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: automations.stories[id]?.createdAt || new Date().toISOString()
    };
    
    // Save back to file
    await saveAutomations(automations);
    
    console.log(`✅ Automation saved for story ${id}`);
    return { 
      success: true, 
      automation: automations.stories[id],
      message: 'Automation saved successfully' 
    };
  } catch (error) {
    console.error('Error saving story automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to save automation' 
    });
  }
});

// Delete automation for a specific reel
fastify.delete('/api/automation/reel/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    
    console.log(`🗑️ Deleting automation for reel ${id}`);
    
    // Read current automations
    const automations = await readAutomations();
    
    // Delete the specific reel automation
    delete automations.reels[id];
    
    // Save back to file
    await saveAutomations(automations);
    
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

// Delete automation for a specific story
fastify.delete('/api/automation/story/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    
    console.log(`🗑️ Deleting automation for story ${id}`);
    
    // Read current automations
    const automations = await readAutomations();
    
    // Delete the specific story automation
    delete automations.stories[id];
    
    // Save back to file
    await saveAutomations(automations);
    
    console.log(`✅ Automation deleted for story ${id}`);
    return { 
      success: true, 
      message: 'Automation deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting story automation:', error);
    return reply.code(500).send({ 
      success: false, 
      error: 'Failed to delete automation' 
    });
  }
});

// Dynamic token update endpoint - Update token without restart
fastify.post('/api/admin/update-token', async (request, reply) => {
  const { token, adminKey } = request.body;
  
  // Simple security check
  if (adminKey !== 'your-secret-admin-key-2024') {
    return reply.code(403).send({ error: 'Unauthorized' });
  }
  
  if (!token) {
    return reply.code(400).send({ error: 'Token required' });
  }
  
  // Update the environment variable in memory
  process.env.INSTAGRAM_BOT_ACCESS_TOKEN = token;
  
  console.log('✅ Token updated in memory without restart!');
  console.log('New token preview:', token.substring(0, 10) + '...');
  
  return {
    success: true,
    message: 'Token updated successfully',
    tokenPreview: token.substring(0, 10) + '...'
  };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Something went wrong!' });
});

// Start server
const start = async () => {
  try {
    // Parse PORT as integer and use 0.0.0.0 to bind to all interfaces
    const port = parseInt(PORT, 10);
    await fastify.listen({ 
      port: port, 
      host: '0.0.0.0'  // Important for Railway/Docker deployments
    });
    console.log(`🚀 InstaAuto Backend (Fastify) running on port ${port}`);
    console.log('✅ CORS configured for all origins (temporary for debugging)');
    console.log(`📡 Server is listening on all interfaces (0.0.0.0:${port})`);
  } catch (err) {
    fastify.log.error(err);
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = fastify;
