const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const secretKey = process.env.JWT_SECRET || 'mytenomk';
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.user.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

const authorizeEventOrganizer = (req, res, next) => {
  if (req.user.role !== 'event_organizer') {
    return res.status(403).json({ message: 'Access denied. Event organizer privileges required.' });
  }
  next();
};

const authorizeAdminOrOrganizer = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'event_organizer') {
    return res.status(403).json({ message: 'Access denied. Admin or event organizer privileges required.' });
  }
  next();
};

const authorizeStandardUser = (req, res, next) => {
  if (req.user.role !== 'standard_user') {
    return res.status(403).json({ message: 'Access denied. Standard user privileges required.' });
  }
  next();
};

const authenticatedUser = (req, res, next) => {
  const validRoles = ['admin', 'event_organizer', 'standard_user'];
  if (!validRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Valid user role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeEventOrganizer,
  authorizeAdminOrOrganizer,
  authorizeStandardUser,
  authenticatedUser
}; 