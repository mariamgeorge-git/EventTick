const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  try {
    console.log('Authenticating request:', {
      path: req.path,
      method: req.method,
      headers: req.headers
    });

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log('Token found:', token.substring(0, 20) + '...');

    const secretKey = process.env.JWT_SECRET || 'mytenomk';
    const decoded = jwt.verify(token, secretKey);
    
    console.log('Decoded token:', {
      userId: decoded.user.userId,
      role: decoded.user.role
    });

    const user = await User.findById(decoded.user.userId);

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    console.log('User authenticated:', {
      id: user._id,
      role: user.role
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format.' });
    }
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  console.log('Checking admin authorization for user:', req.user.role);
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

const authorizeEventOrganizer = (req, res, next) => {
  console.log('Checking event organizer authorization for user:', req.user.role);
  if (req.user.role !== 'event_organizer') {
    return res.status(403).json({ message: 'Access denied. Event organizer privileges required.' });
  }
  next();
};

const authorizeAdminOrOrganizer = (req, res, next) => {
  console.log('Checking admin/organizer authorization for user:', req.user.role);
  if (req.user.role !== 'admin' && req.user.role !== 'event_organizer') {
    return res.status(403).json({ message: 'Access denied. Admin or event organizer privileges required.' });
  }
  next();
};

const authorizeStandardUser = (req, res, next) => {
  console.log('Checking standard user authorization for user:', req.user.role);
  if (req.user.role !== 'standard_user') {
    return res.status(403).json({ message: 'Access denied. Standard user privileges required.' });
  }
  next();
};

const authenticatedUser = (req, res, next) => {
  console.log('Checking authenticated user role:', req.user.role);
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