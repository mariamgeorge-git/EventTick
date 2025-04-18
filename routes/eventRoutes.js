const express = require('express');
const eventController = require('../Controllers/eventController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/events', eventController.getAllEvents); 
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', authenticateToken, eventController.createEvent);
router.put('/:id', authenticateToken, eventController.updateEvent);
router.delete('/:id', authenticateToken, eventController.deleteEvent);
router.get('/organizer/analytics', authenticateToken, eventController.getMyEventAnalytics);

// Admin routes
router.put('/:id/status', authenticateToken, authorizeAdmin, eventController.updateEventStatus);

module.exports = router;