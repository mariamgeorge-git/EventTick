const express = require("express");
const bookingController = require("../Controllers/bookingController");
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Book tickets for an event (Student)
router.post("/", authenticateToken, bookingController.createBooking);

// Get booking details by ID (Student)
router.get("/:id", authenticateToken, bookingController.getBookingById);

// Cancel a booking (Student)
router.delete("/:id", authenticateToken, bookingController.cancelBooking);

module.exports = router;