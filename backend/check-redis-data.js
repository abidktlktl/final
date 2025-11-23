const redis = require('redis');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkRedisData() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Redis Cloud...');
  
  const client = redis.createClient({
    url: redisUrl
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  try {
    await client.connect();
    console.log('✅ Connected to Redis successfully\n');

    // Get ALL keys
    const allKeys = await client.keys('*');
    console.log(`📋 Total keys in Redis: ${allKeys.length}`);
    
    if (allKeys.length === 0) {
      console.log('⚠️  Redis is empty - no data stored yet');
    } else {
      console.log('\n📊 All Redis keys:');
      for (const key of allKeys) {
        const type = await client.type(key);
        console.log(`   - ${key} (type: ${type})`);
        
        // If it's a string type and looks like automation data, show it
        if (type === 'string' && key.includes('automation')) {
          const value = await client.get(key);
          try {
            const parsed = JSON.parse(value);
            console.log(`     Media IDs: ${Object.keys(parsed).join(', ')}`);
          } catch (e) {
            console.log(`     Value: ${value.substring(0, 100)}...`);
          }
        }
      }
    }
    
    // Check for the specific media in any automation key
    console.log('\n🔍 Searching for media 18079535117326762 in all keys...');
    let found = false;
    
    for (const key of allKeys) {
      const type = await client.type(key);
      if (type === 'string') {
        const value = await client.get(key);
        if (value && value.includes('18079535117326762')) {
          found = true;
          console.log(`   ✅ Found in key: ${key}`);
          try {
            const parsed = JSON.parse(value);
            if (parsed['18079535117326762']) {
              console.log('   Current settings:');
              console.log(`     - autoDmOnComment: ${parsed['18079535117326762'].autoDmOnComment}`);
              console.log(`     - dmOnCommentMessage: ${parsed['18079535117326762'].dmOnCommentMessage || 'Not set'}`);
            }
          } catch (e) {
            // Not JSON
          }
        }
      }
    }
    
    if (!found) {
      console.log('   ❌ Media 18079535117326762 not found in any Redis key');
      console.log('\n💡 This media needs to be set up first:');
      console.log('   1. Go to your dashboard');
      console.log('   2. Find the post/reel with ID 18079535117326762');
      console.log('   3. Set up automation for it');
      console.log('   4. Then run enable-auto-dm.js again');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.disconnect();
    console.log('\n👋 Disconnected from Redis');
  }
}

// Run the script
checkRedisData().catch(console.error);
