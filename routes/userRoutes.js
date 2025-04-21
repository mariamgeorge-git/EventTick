const express = require('express');
const userController = require('../Controllers/userController');
const { authenticateToken, authorizeAdmin, authorizeEventOrganizer, authorizeStandardUser, authenticatedUser } = require('../middleware/auth');

const router = express.Router();


router.get('/profile', authenticateToken, authenticatedUser, userController.getCurrentUser);
router.put('/profile', authenticateToken, authenticatedUser, userController.updateUser);


router.get('/bookings', authenticateToken, (req, res, next) => {
  if (req.user.role === 'standard_user' || req.user.role === 'event_organizer' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Standard user, event organizer, or admin privileges required.' });
  }
}, userController.getUserBookings);


router.get('/events', authenticateToken, authorizeEventOrganizer, userController.getUserEvents);
router.get('/events/analytics', authenticateToken, authorizeEventOrganizer, userController.getUserEventsAnalytics);


router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUser);
router.put('/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;