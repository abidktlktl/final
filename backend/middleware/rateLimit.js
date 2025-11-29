/**
 * Simple rate limiting middleware
 */

const requestCounts = new Map();

/**
 * Rate limit by user ID
 * Default: 100 requests per minute
 */
export const rateLimitByUser = (limit = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(userId)) {
      requestCounts.set(userId, []);
    }

    let requests = requestCounts.get(userId);
    requests = requests.filter(timestamp => timestamp > windowStart);

    if (requests.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }

    requests.push(now);
    requestCounts.set(userId, requests);

    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': limit - requests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
};
