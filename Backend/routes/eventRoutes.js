const express = require('express');
const eventController = require('../Controllers/eventController');
const { authenticateToken, authorizeAdmin, authorizeEventOrganizer, authorizeAdminOrOrganizer } = require('../middleware/auth');

const router = express.Router();


router.get('/', eventController.getApprovedEvents);


router.post('/', authenticateToken, authorizeEventOrganizer, eventController.createEvent);
router.get('/organizer/analytics', authenticateToken, eventController.getMyEventAnalytics);


router.get('/all', authenticateToken, authorizeAdmin, eventController.getEvents);


router.get('/:id', eventController.getEventById);
router.put('/:id', authenticateToken, authorizeAdminOrOrganizer, eventController.updateEvent);
router.delete('/:id', authenticateToken, authorizeAdminOrOrganizer, eventController.deleteEvent);
router.put('/:id/status', authenticateToken, authorizeAdmin, eventController.updateEventStatus);

module.exports = router;