const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEventAnalytics,
  updateEventStatus
} = require('../Controllers/eventController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer
router.post('/', protect, authorizeRoles('organizer'), createEvent);
router.put('/:id', protect, authorizeRoles('organizer'), updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer'), deleteEvent);
router.get('/organizer/analytics', protect, authorizeRoles('organizer'), getMyEventAnalytics);

// Admin
router.put('/:id/status', protect, authorizeRoles('admin'), updateEventStatus);

module.exports = router;
