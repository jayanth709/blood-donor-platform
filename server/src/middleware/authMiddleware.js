const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

/**
 * PROTECT MIDDLEWARE
 * Verifies Bearer JWT and attaches the user row to req.user
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided. Access denied.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_bloodlink_sqlite_jwt_2026!@#$';
    const decoded = jwt.verify(token, secret);

    // Fetch fresh user from DB on each request (detects suspended accounts instantly)
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, phone, role, is_active FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Token invalid.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Contact platform administration.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

/**
 * ROLE MIDDLEWARE
 * Usage: authorize('admin') or authorize('donor', 'hospital')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
