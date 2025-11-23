#!/usr/bin/env node

/**
 * Test Redis Connection Script
 * Run this to verify Redis connectivity before deployment
 */

require('dotenv').config();
const Redis = require('ioredis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n');
  
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log('📍 Redis URL:', redisUrl.replace(/:[^:@]*@/, ':****@')); // Hide password
  
  try {
    // Create Redis client
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      tls: redisUrl.includes('rediss://') || redisUrl.includes('redis-cloud.com') ? {
        rejectUnauthorized: false
      } : undefined
    });

    // Test basic operations
    console.log('\n📝 Running connection tests...\n');
    
    // 1. Ping test
    console.log('1. PING test...');
    const pingResult = await client.ping();
    console.log('   ✅ PING successful:', pingResult);
    
    // 2. Set/Get test
    console.log('\n2. SET/GET test...');
    await client.set('test:key', 'Hello Redis!');
    const getValue = await client.get('test:key');
    console.log('   ✅ SET/GET successful:', getValue);
    
    // 3. Increment test
    console.log('\n3. INCREMENT test...');
    await client.set('test:counter', 0);
    const incrResult = await client.incr('test:counter');
    console.log('   ✅ INCREMENT successful:', incrResult);
    
    // 4. Hash test
    console.log('\n4. HASH operations test...');
    await client.hset('test:hash', 'field1', 'value1');
    const hashValue = await client.hget('test:hash', 'field1');
    console.log('   ✅ HASH operations successful:', hashValue);
    
    // 5. Set with expiry test
    console.log('\n5. EXPIRY test...');
    await client.setex('test:expiry', 5, 'expires in 5 seconds');
    const ttl = await client.ttl('test:expiry');
    console.log('   ✅ EXPIRY successful, TTL:', ttl, 'seconds');
    
    // 6. List operations test
    console.log('\n6. LIST operations test...');
    await client.rpush('test:list', 'item1', 'item2', 'item3');
    const listLength = await client.llen('test:list');
    console.log('   ✅ LIST operations successful, length:', listLength);
    
    // 7. Set operations test
    console.log('\n7. SET operations test...');
    await client.sadd('test:set', 'member1', 'member2', 'member3');
    const setSize = await client.scard('test:set');
    console.log('   ✅ SET operations successful, size:', setSize);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await client.del('test:key', 'test:counter', 'test:hash', 'test:expiry', 'test:list', 'test:set');
    console.log('   ✅ Cleanup complete');
    
    // Get Redis info
    console.log('\n📊 Redis Server Info:');
    const info = await client.info('server');
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.includes('redis_version:') || line.includes('redis_mode:') || line.includes('uptime_in_days:')) {
        console.log('   ', line.trim());
      }
    }
    
    // Test memory info
    const memoryInfo = await client.info('memory');
    const memLines = memoryInfo.split('\n');
    for (const line of memLines) {
      if (line.includes('used_memory_human:')) {
        console.log('   ', line.trim());
      }
    }
    
    console.log('\n✅ All Redis tests passed successfully!');
    console.log('🚀 Redis is ready for production use.\n');
    
    // Disconnect
    await client.quit();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Redis connection test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Suggestions:');
      console.error('1. Make sure Redis is running');
      console.error('2. Check if the Redis URL is correct');
      console.error('3. Verify network connectivity');
    } else if (error.message.includes('NOAUTH')) {
      console.error('\n💡 Suggestions:');
      console.error('1. Check if the Redis password is correct');
      console.error('2. Verify the Redis URL format');
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testRedisConnection();
}

module.exports = { testRedisConnection };
