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

const { protect, authorizeRoles } = require('../middleware/authorization');

const router = express.Router();

// Public: View all events and view a single event
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer: Create, update, delete events and view event analytics
router.post('/',  createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/organizer/analytics', getMyEventAnalytics);

// Admin: Update event status
router.put('/:id/status', updateEventStatus);

module.exports = router;