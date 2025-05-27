const express = require('express');
const userController = require('../Controllers/userController');
const { authenticateToken, authorizeAdmin, authorizeEventOrganizer, authorizeStandardUser, authenticatedUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Debug middleware for user routes
router.use((req, res, next) => {
  console.log('User route accessed:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// Admin user creation route - this should come before other routes to avoid conflicts
router.post('/admin', (req, res, next) => {
  console.log('Admin creation route accessed');
  next();
}, userController.createAdminUser);

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forget-password', userController.forgetPassword);
router.post('/verify-reset-password', userController.verifyAndResetPassword);

// User profile routes
router.get('/profile', authenticateToken, authenticatedUser, userController.getCurrentUser);
router.put('/profile', 
  authenticateToken, 
  authenticatedUser, 
  upload.single('profileImage'),
  userController.updateUser
);

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
router.get('/users', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUser);
router.put('/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeAdmin, userController.deleteUser);
router.put('/users/:id/role', authenticateToken, authorizeAdmin, userController.updateUserRole);

module.exports = router;