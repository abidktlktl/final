#!/usr/bin/env node

/**
 * Test Private Reply API
 * Tests the ability to send DMs via comment IDs
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

async function testPrivateReply(commentId, message) {
  const token = process.env.INSTAGRAM_BOT_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841476775670281';
  
  if (!token) {
    console.error(`${colors.red}❌ No token found in .env${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.cyan}🧪 Testing Private Reply API${colors.reset}`);
  console.log(`📝 Comment ID: ${commentId}`);
  console.log(`💬 Message: ${message}`);
  console.log(`🆔 IG Account: ${igAccountId}`);
  console.log(`🔑 Token preview: ${token.substring(0, 20)}...`);
  
  try {
    // Test 1: Using comment_id in recipient (Private Reply API)
    console.log(`\n${colors.yellow}Test 1: Private Reply API (comment_id)${colors.reset}`);
    
    const privateReplyUrl = `https://graph.facebook.com/v18.0/${igAccountId}/messages`;
    const response1 = await fetch(privateReplyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { 
          comment_id: commentId  // Private Reply format
        },
        message: { 
          text: message 
        },
        access_token: token
      })
    });
    
    const result1 = await response1.json();
    
    if (response1.ok) {
      console.log(`${colors.green}✅ Private Reply sent successfully!${colors.reset}`);
      console.log('   Message ID:', result1.message_id);
      console.log('   Recipient ID:', result1.recipient_id);
      return true;
    } else {
      console.log(`${colors.red}❌ Private Reply failed${colors.reset}`);
      console.log('   Error:', JSON.stringify(result1.error, null, 2));
      
      // Analyze error
      if (result1.error?.code === 3) {
        console.log(`\n${colors.yellow}📋 Error Analysis:${colors.reset}`);
        console.log('   Error Code 3: Application does not have the capability');
        console.log('   This means your app needs Facebook App Review approval');
        console.log('   for the instagram_manage_messages permission to work in production.');
        console.log(`\n${colors.cyan}Solutions:${colors.reset}`);
        console.log('   1. Submit your app for App Review');
        console.log('   2. Use test users while in Development mode');
        console.log('   3. Get a Page Access Token from an approved app');
      } else if (result1.error?.code === 100) {
        console.log(`\n${colors.yellow}📋 Error Analysis:${colors.reset}`);
        console.log('   Error Code 100: Invalid parameter');
        console.log('   The comment_id might be invalid or expired');
      } else if (result1.error?.code === 190) {
        console.log(`\n${colors.yellow}📋 Error Analysis:${colors.reset}`);
        console.log('   Error Code 190: Token error');
        console.log('   The token might be expired or invalid');
      }
    }
    
    // Test 2: Try with URL parameters instead of body
    console.log(`\n${colors.yellow}Test 2: Private Reply with URL params${colors.reset}`);
    
    const urlWithParams = `${privateReplyUrl}?access_token=${token}`;
    const response2 = await fetch(urlWithParams, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { 
          comment_id: commentId
        },
        message: { 
          text: message 
        }
      })
    });
    
    const result2 = await response2.json();
    
    if (response2.ok) {
      console.log(`${colors.green}✅ Private Reply (URL params) sent successfully!${colors.reset}`);
      console.log('   Message ID:', result2.message_id);
      return true;
    } else {
      console.log(`${colors.red}❌ Private Reply (URL params) failed${colors.reset}`);
      console.log('   Error:', JSON.stringify(result2.error, null, 2));
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Test failed with error:${colors.reset}`, error.message);
    return false;
  }
  
  return false;
}

async function testRegularDM(userId, message) {
  const token = process.env.INSTAGRAM_BOT_ACCESS_TOKEN;
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841476775670281';
  
  console.log(`\n${colors.cyan}🧪 Testing Regular DM API${colors.reset}`);
  console.log(`👤 User ID: ${userId}`);
  console.log(`💬 Message: ${message}`);
  
  try {
    const dmUrl = `https://graph.facebook.com/v18.0/${igAccountId}/messages`;
    const response = await fetch(dmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { 
          id: userId  // Regular DM format (user ID)
        },
        message: { 
          text: message 
        },
        access_token: token
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✅ Regular DM sent successfully!${colors.reset}`);
      console.log('   Message ID:', result.message_id);
      return true;
    } else {
      console.log(`${colors.red}❌ Regular DM failed${colors.reset}`);
      console.log('   Error:', JSON.stringify(result.error, null, 2));
      
      if (result.error?.code === 10) {
        console.log('   Note: Error 10 means the user has not messaged you first');
        console.log('   Instagram requires users to initiate conversation');
      }
    }
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
  }
  
  return false;
}

async function getRecentCommentId() {
  // Try to get a recent comment ID from webhook logs
  console.log(`\n${colors.cyan}🔍 Looking for recent comment IDs...${colors.reset}`);
  
  // These are comment IDs from your recent webhook logs
  const recentCommentIds = [
    '18031541678733446',  // Most recent from logs
    '18030190604538772',  // Previous comment
    '18026540405571437'   // Auto-reply comment
  ];
  
  console.log('Found recent comment IDs from logs:');
  recentCommentIds.forEach(id => console.log(`  - ${id}`));
  
  return recentCommentIds[0];
}

async function main() {
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('╔══════════════════════════════════════╗');
  console.log('║    Private Reply API Test Suite      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(colors.reset);
  
  // Get test parameters
  const testCommentId = process.argv[2] || await getRecentCommentId();
  const testMessage = process.argv[3] || 'Test Private Reply from API test script 🧪';
  const testUserId = process.argv[4] || '2611166799223447'; // thehalalway2025 from logs
  
  // Test Private Reply
  console.log(`\n${colors.bright}=== PRIVATE REPLY TEST ===${colors.reset}`);
  const privateReplySuccess = await testPrivateReply(testCommentId, testMessage);
  
  // Test Regular DM (optional)
  if (process.argv.includes('--test-dm')) {
    console.log(`\n${colors.bright}=== REGULAR DM TEST ===${colors.reset}`);
    await testRegularDM(testUserId, 'Test regular DM 📨');
  }
  
  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bright}Test Summary:${colors.reset}`);
  
  if (privateReplySuccess) {
    console.log(`${colors.green}✅ Private Reply API is working!${colors.reset}`);
    console.log('Your token has the necessary permissions.');
  } else {
    console.log(`${colors.red}❌ Private Reply API is not working${colors.reset}`);
    console.log('\nNext Steps:');
    console.log('1. Submit your app for Facebook App Review');
    console.log('2. Request instagram_manage_messages permission');
    console.log('3. Or use test users while in Development mode');
    console.log('\nApp Review URL:');
    console.log('https://developers.facebook.com/apps/1339568027817682/app-review/');
  }
  
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

// Run the test
main().catch(console.error);
