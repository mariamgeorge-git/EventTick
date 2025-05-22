const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/users/forgetpassword', userController.forgetPassword);

// Protected routes for all users
router.get('/profile', authenticateToken, userController.getCurrentUser);
router.put('/profile', authenticateToken, userController.updateUser);
router.get('/user-bookings', authenticateToken, userController.getUserBookings);
router.get('/events', authenticateToken, userController.getUserEvents);
router.get('/events/analytics', authenticateToken, userController.getUserEventsAnalytics);

// Admin routes for managing all users
router.get('/all', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/admin/:id', authenticateToken, authorizeAdmin, userController.getUser);
router.put('/admin/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/admin/:id', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;