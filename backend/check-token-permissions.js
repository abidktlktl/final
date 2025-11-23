#!/usr/bin/env node

/**
 * Token Permission Checker
 * Checks Instagram/Facebook token permissions and capabilities
 */

const fetch = require('node-fetch');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function checkTokenPermissions(token, tokenName = 'Token') {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bright}Checking ${tokenName}${colors.reset}`);
  console.log(`Token preview: ${token.substring(0, 20)}...`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  try {
    // 1. Check token permissions
    console.log(`${colors.yellow}📋 Fetching permissions...${colors.reset}`);
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`
    );
    const permissionsData = await permissionsResponse.json();

    if (permissionsData.error) {
      console.error(`${colors.red}❌ Error checking permissions:${colors.reset}`, permissionsData.error.message);
      return false;
    }

    // 2. Check token debug info
    console.log(`${colors.yellow}🔍 Fetching token info...${colors.reset}`);
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?` +
      `input_token=${token}&` +
      `access_token=${token}`
    );
    const debugData = await debugResponse.json();

    // 3. Display token info
    console.log(`\n${colors.bright}📊 Token Information:${colors.reset}`);
    console.log('├─ Type:', debugData.data?.type || 'Unknown');
    console.log('├─ App ID:', debugData.data?.app_id || 'Unknown');
    console.log('├─ User ID:', debugData.data?.user_id || 'Unknown');
    console.log('├─ Valid:', debugData.data?.is_valid ? '✅ Yes' : '❌ No');
    
    if (debugData.data?.expires_at) {
      const expiryDate = new Date(debugData.data.expires_at * 1000);
      console.log('├─ Expires:', expiryDate.toLocaleString());
    } else {
      console.log('├─ Expires: Never (long-lived token)');
    }

    // 4. Display permissions
    console.log(`\n${colors.bright}🔐 Permissions Status:${colors.reset}`);
    const permissions = permissionsData.data || [];
    
    // Critical permissions for DM functionality
    const criticalPermissions = [
      'instagram_basic',
      'instagram_manage_comments',
      'instagram_manage_messages',  // CRITICAL for Private Reply
      'pages_show_list',
      'pages_manage_metadata'
    ];

    criticalPermissions.forEach(perm => {
      const permission = permissions.find(p => p.permission === perm);
      if (permission) {
        const status = permission.status === 'granted' ? 
          `${colors.green}✅ GRANTED${colors.reset}` : 
          `${colors.red}❌ ${permission.status.toUpperCase()}${colors.reset}`;
        console.log(`├─ ${perm}: ${status}`);
      } else {
        console.log(`├─ ${perm}: ${colors.red}❌ NOT FOUND${colors.reset}`);
      }
    });

    // Show other permissions
    const otherPerms = permissions.filter(p => 
      !criticalPermissions.includes(p.permission)
    );
    
    if (otherPerms.length > 0) {
      console.log(`\n${colors.bright}📜 Other Permissions:${colors.reset}`);
      otherPerms.forEach(p => {
        const status = p.status === 'granted' ? '✅' : '❌';
        console.log(`├─ ${p.permission}: ${status} ${p.status}`);
      });
    }

    // 5. Check specific capability for Private Reply
    const hasMessaging = permissions.some(p => 
      p.permission === 'instagram_manage_messages' && 
      p.status === 'granted'
    );

    console.log(`\n${colors.bright}🚀 Private Reply Capability:${colors.reset}`);
    if (hasMessaging) {
      console.log(`${colors.green}✅ This token CAN send Private Replies (DMs on comments)${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ This token CANNOT send Private Replies${colors.reset}`);
      console.log(`${colors.yellow}⚠️  Missing 'instagram_manage_messages' permission${colors.reset}`);
      console.log(`\n${colors.cyan}To fix this:${colors.reset}`);
      console.log('1. Submit your app for App Review');
      console.log('2. Request instagram_manage_messages permission');
      console.log('3. Or use a Page Access Token with proper permissions');
    }

    // 6. Test if this is a Page token
    if (debugData.data?.type === 'PAGE') {
      console.log(`\n${colors.green}✅ This is a Page Access Token${colors.reset}`);
      console.log('Page tokens typically have more permissions for business features');
    } else if (debugData.data?.type === 'USER') {
      console.log(`\n${colors.yellow}⚠️  This is a User Access Token${colors.reset}`);
      console.log('Consider using a Page Access Token for business features');
    }

    return hasMessaging;

  } catch (error) {
    console.error(`${colors.red}❌ Error checking token:${colors.reset}`, error.message);
    return false;
  }
}

async function checkAllTokens() {
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Instagram Token Permission Check   ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(colors.reset);

  // Check environment variable token
  if (process.env.INSTAGRAM_BOT_ACCESS_TOKEN) {
    await checkTokenPermissions(
      process.env.INSTAGRAM_BOT_ACCESS_TOKEN, 
      'Environment Token (INSTAGRAM_BOT_ACCESS_TOKEN)'
    );
  } else {
    console.log(`${colors.yellow}⚠️  No INSTAGRAM_BOT_ACCESS_TOKEN found in .env${colors.reset}`);
  }

  // Check if user provided a token as argument
  const userToken = process.argv[2];
  if (userToken) {
    await checkTokenPermissions(userToken, 'Provided Token');
  }

  // Check Redis for stored tokens
  try {
    const redisClient = require('./redis-enhanced');
    await redisClient.connect();
    
    console.log(`\n${colors.cyan}🔍 Checking for tokens in Redis...${colors.reset}`);
    
    // Get all users from Redis
    const users = await redisClient.redis.keys('user:ig_*');
    
    if (users.length > 0) {
      for (const userKey of users) {
        const userData = await redisClient.redis.get(userKey);
        if (userData) {
          const user = JSON.parse(userData);
          if (user.page_token) {
            console.log(`\nFound Page Token for ${user.instagram_username || userKey}`);
            await checkTokenPermissions(user.page_token, `Page Token (${user.page_name || 'Unknown Page'})`);
          }
        }
      }
    } else {
      console.log('No user tokens found in Redis');
    }
    
    await redisClient.disconnect();
  } catch (error) {
    console.log(`${colors.yellow}Could not check Redis for tokens: ${error.message}${colors.reset}`);
  }

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log('• Private Reply requires instagram_manage_messages permission');
  console.log('• Page Access Tokens usually have more permissions');
  console.log('• Submit for App Review if permissions are missing');
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

// Run the checker
checkAllTokens().catch(console.error);

// Export for use in other scripts
module.exports = { checkTokenPermissions };
