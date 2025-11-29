import jwt from 'jsonwebtoken';

/**
 * Authenticate JWT token from Authorization header
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Missing authentication token',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      scope: decoded.scope || []
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Generate JWT token for testing
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    {
      sub: userId,
      email: email,
      scope: ['automations']
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};
