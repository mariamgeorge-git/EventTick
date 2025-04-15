const express = require('express');
const { bookTickets, getUserBookings, cancelBooking } = require('../Controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authorization');

const router = express.Router();

// Only standard users
router.post('/', protect, authorizeRoles('user'), bookTickets);
router.get('/', protect, authorizeRoles('user'), getUserBookings);
router.delete('/:id', protect, authorizeRoles('user'), cancelBooking);

module.exports = router;
