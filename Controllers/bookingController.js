const bookingModel = require("../models/BookingModel");
const eventModel = require("../models/EventModel");
const User = require("../models/User");
//const { sendEmail } = require('../utils/emailService');

const bookingController = {
  // Book tickets for an event
  createBooking: async (req, res) => {
    try {
      const { eventId, numberOfTickets } = req.body;
      const userId = req.user._id;

      // Input validation
      if (!eventId || !numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: "Please provide both eventId and numberOfTickets"
        });
      }

      // Validate numberOfTickets is a positive integer
      const ticketCount = parseInt(numberOfTickets);
      if (isNaN(ticketCount) || ticketCount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Number of tickets must be a positive number"
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

      // Check if event has a valid price
      if (!event.price || typeof event.price !== 'number' || event.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Event has an invalid ticket price"
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
      if (!event.ticketsAvailable || event.ticketsAvailable < ticketCount) {
        return res.status(400).json({
          success: false,
          message: "Not enough tickets available"
        });
      }

      // Calculate total price (handle decimal precision)
      const totalPrice = Number((event.price * ticketCount).toFixed(2));
      
      // Validate total price
      if (isNaN(totalPrice) || totalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Error calculating total price"
        });
      }

      // Create the booking
      const booking = new bookingModel({
        event: eventId,
        user: userId,
        numberOfTickets: ticketCount,
        totalPrice,
        status: 'confirmed'
      });

      // Update available tickets
      event.ticketsAvailable -= ticketCount;
      
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

      // Send confirmation email - Commented out since email service is not implemented
      /*
      try {
        await sendEmail({
          to: req.user.email,
          subject: 'Booking Confirmation',
          text: `Your booking for ${event.name} has been confirmed. Number of tickets: ${ticketCount}, Total price: $${totalPrice}`
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
      */

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
      const bookingId = req.params.id;
      
      // Validate booking ID format
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required"
        });
      }

      // Find booking with populated fields
      const booking = await bookingModel.findById(bookingId)
        .populate('event', 'title date location price ticketsAvailable status')
        .populate('user', 'name email');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      // Check if the booking belongs to the requesting user
      if (String(booking.user._id) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this booking",
          detail: "You can only view your own bookings"
        });
      }

      // Include user information in the response
      return res.status(200).json({
        success: true,
        data: {
          bookingId: booking._id,
          event: {
            title: booking.event.title,
            date: booking.event.date,
            location: booking.event.location,
            price: booking.event.price,
            status: booking.event.status
          },
          user: {
            id: booking.user._id,
            name: booking.user.name,
            email: booking.user.email
          },
          numberOfTickets: booking.numberOfTickets,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt
        }
      });
    } catch (error) {
      console.error('Get Booking Error:', error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving booking details",
        error: error.message
      });
    }
  },

  // Cancel a booking
  cancelBooking: async (req, res) => {
    try {
      const booking = await bookingModel.findById(req.params.id)
        .populate('event', 'title ticketsAvailable');
      
      if (!booking) {
        return res.status(404).json({ 
          success: false,
          message: "Booking not found" 
        });
      }

      // Check if the booking belongs to the requesting user
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized to cancel this booking" 
        });
      }

      // Check if booking is already cancelled
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: "Booking is already cancelled"
        });
      }

      // Update event's available tickets
      const event = await eventModel.findById(booking.event._id);
      if (event) {
        event.ticketsAvailable += booking.numberOfTickets;
        await event.save();
      }

      // Update booking status
      booking.status = 'cancelled';
      await booking.save();

      return res.status(200).json({ 
        success: true,
        message: "Booking cancelled successfully",
        data: {
          bookingId: booking._id,
          event: booking.event.title,
          numberOfTickets: booking.numberOfTickets,
          status: booking.status
        }
      });
    } catch (error) {
      console.error('Cancel Booking Error:', error);
      return res.status(500).json({
        success: false,
        message: "Error cancelling booking",
        error: error.message
      });
    }
  }
};

module.exports = bookingController;