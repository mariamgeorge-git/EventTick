const bookingModel = require("../models/BookingModel");
const eventModel = require("../models/EventModel");
const User = require("../models/User");
//const { sendEmail } = require('../utils/emailService');

const bookingController = {
  // Book tickets for an event
  createBooking: async (req, res) => {
    try {
      const { eventId, numberOfTickets } = req.body;
      const userId = req.user.id;

      // Input validation
      if (!eventId || !numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: "Please provide both eventId and numberOfTickets"
        });
      }

      if (numberOfTickets <= 0) {
        return res.status(400).json({
          success: false,
          message: "Number of tickets must be greater than 0"
        });
      }

      // Find the event and check if it exists
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }

      // Check if event is approved
      if (event.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: "Cannot book tickets for an unapproved event"
        });
      }

      // Check if event date has passed
      if (new Date(event.date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Cannot book tickets for a past event"
        });
      }

      // Check if enough tickets are available
      if (event.ticketsAvailable < numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: "Not enough tickets available"
        });
      }

      // Calculate total price (handle decimal precision)
      const totalPrice = parseFloat((event.price * numberOfTickets).toFixed(2));

      // Create the booking
      const booking = new bookingModel({
        event: eventId,
        user: userId,
        numberOfTickets,
        totalPrice,
        status: 'confirmed'
      });

      // Update available tickets
      event.ticketsAvailable -= numberOfTickets;
      
      // Save both booking and updated event in a transaction
      const session = await bookingModel.startSession();
      session.startTransaction();
      
      try {
        await booking.save({ session });
        await event.save({ session });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      // Populate event and user details for the response
      await booking.populate('event');
      await booking.populate('user', 'name email');

      // Send confirmation email
      try {
        await sendEmail({
          to: req.user.email,
          subject: 'Booking Confirmation',
          text: `Your booking for ${event.title} has been confirmed. Number of tickets: ${numberOfTickets}, Total price: $${totalPrice}`
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      res.status(201).json({
        success: true,
        data: booking
      });

    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(500).json({
        success: false,
        message: "Error creating booking",
        error: error.message
      });
    }
  },

  // Get booking details by ID
  getBookingById: async (req, res) => {
    try {
      const booking = await bookingModel.findById(req.params.id)
        .populate('event', 'title date location')
        .populate('user', 'name email');

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if the booking belongs to the requesting user
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }

      return res.status(200).json(booking);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Cancel a booking
  cancelBooking: async (req, res) => {
    try {
      const booking = await bookingModel.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if the booking belongs to the requesting user
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }

      // Update event's available tickets
      const event = await eventModel.findById(booking.event);
      if (event) {
        event.ticketsAvailable += booking.numberOfTickets;
        await event.save();
      }

      // Update booking status
      booking.status = 'cancelled';
      await booking.save();

      return res.status(200).json({ 
        message: "Booking cancelled successfully" 
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = bookingController;
