const express = require("express");
const bookingController = require("../Controllers/bookingController");
const { authenticateToken, authorizeStandardUser } = require('../middleware/auth');

const router = express.Router();


router.post("/", authenticateToken, authorizeStandardUser, bookingController.createBooking);
router.get("/:id", authenticateToken, authorizeStandardUser, bookingController.getBookingById);
router.delete("/:id", authenticateToken, authorizeStandardUser, bookingController.cancelBooking);

module.exports = router;