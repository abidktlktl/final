// Add this endpoint to your backend/server.js file
// This allows dynamic token update without restart

// Dynamic token update endpoint (add this to your server.js)
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
