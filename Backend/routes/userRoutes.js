const express = require('express');
const userController = require('../Controllers/userController');
const { authenticateToken, authorizeAdmin, authorizeEventOrganizer, authorizeStandardUser, authenticatedUser } = require('../middleware/auth');

const router = express.Router();

// User profile routes
router.get('/profile', authenticateToken, authenticatedUser, userController.getCurrentUser);
router.put('/profile', authenticateToken, authenticatedUser, userController.updateUser);

// MFA routes
router.post('/setup-mfa', authenticateToken, async (req, res, next) => {
  console.log('MFA setup request received:', {
    user: req.user,
    headers: req.headers
  });
  next();
}, userController.setupMfa);

router.post('/verify-mfa-setup', authenticateToken, async (req, res, next) => {
  console.log('MFA verification request received:', {
    body: req.body,
    user: req.user
  });
  next();
}, userController.verifyMfaSetup);

router.post('/mfa/verify', async (req, res, next) => {
  console.log('MFA code verification request received:', {
    body: {
      hasMfaCode: !!req.body.mfaCode,
      hasTempToken: !!req.body.tempToken
    },
    headers: {
      authorization: !!req.headers.authorization,
      contentType: req.headers['content-type']
    }
  });
  next();
}, userController.verifyMfaCode);

// Booking routes
router.get('/bookings', authenticateToken, (req, res, next) => {
  if (req.user.role === 'standard_user' || req.user.role === 'event_organizer' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Standard user, event organizer, or admin privileges required.' });
  }
}, userController.getUserBookings);

// Event organizer routes
router.get('/events', authenticateToken, authorizeEventOrganizer, userController.getUserEvents);
router.get('/events/analytics', authenticateToken, authorizeEventOrganizer, userController.getUserEventsAnalytics);

// Admin routes
router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUser);
router.put('/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;