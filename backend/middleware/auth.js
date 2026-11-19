const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Protect routes - verify JWT token
exports.protect = (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, getJwtSecret());

    // Get user from database
    const user = User.findById(decoded.id);

    if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session is no longer valid',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Optional auth - attach user if token provided
exports.optionalAuth = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = User.findById(decoded.id);
      if (user && (decoded.sessionVersion ?? 0) === user.sessionVersion) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, but continue without user
    }
  }

  next();
};

