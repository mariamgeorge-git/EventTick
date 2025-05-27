const bookingModel = require("../models/BookingModel");
const eventModel = require("../models/EventModel");
const User = require("../models/User");


const bookingController = {
  
  createBooking: async (req, res) => {
    try {
      const { eventId, numberOfTickets } = req.body;
      const userId = req.user.userId;

      
      if (!eventId || !numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: "Please provide both eventId and numberOfTickets"
        });
      }

      
      const ticketCount = parseInt(numberOfTickets);
      if (isNaN(ticketCount) || ticketCount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Number of tickets must be a positive number"
        });
      }

      
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"

    
        });
      }
      console.log(event); 
      
      if (!event.Price || typeof event.Price !== 'number' || event.Price < 0) {
        return res.status(400).json({
          success: false,
          message: "Event has an invalid ticket price"
        });
      }

      
      if (event.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: "Cannot book tickets for an unapproved event"
        });
      }

      
      if (new Date(event.date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Cannot book tickets for a past event"
        });
      }

      
      if (!event.ticketsAvailable || event.ticketsAvailable < ticketCount) {
        return res.status(400).json({
          success: false,
          message: "Not enough tickets available"
        });
      }

      
      const totalPrice = Number((event.Price * ticketCount).toFixed(2));
      
     
      if (isNaN(totalPrice) || totalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Error calculating total price"
        });
      }

      
      const booking = new bookingModel({
        event: eventId,
        user: userId,
        numberOfTickets: ticketCount,
        totalPrice,
        status: 'confirmed'
      });

      
      event.ticketsAvailable -= ticketCount;
      
      
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

      
      await booking.populate('event');
      await booking.populate('user', 'name email');

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

  
  getBookingById: async (req, res) => {
    try {
      const bookingId = req.params.id;
      
      
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required"
        });
      }

      
      const booking = await bookingModel.findById(bookingId)
        .populate('event', 'title date location Price ticketsAvailable status')
        .populate('user', 'name email');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      
      if (String(booking.user._id) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this booking",
          detail: "You can only view your own bookings"
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          bookingId: booking._id,
          event: {
            title: booking.event.title,
            date: booking.event.date,
            location: booking.event.location,
            price: booking.event.Price,
            status: booking.event.status
          },
          numberOfTickets: booking.numberOfTickets,
          totalPrice: booking.totalPrice,
          status: booking.status,
          user: {
            name: booking.user.name,
            email: booking.user.email
          },
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

      // Ensure the user canceling the booking is the owner of the booking
      if (!req.user || String(booking.user) !== String(req.user.userId)) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized to cancel this booking" 
        });
      }

      
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: "Booking is already cancelled"
        });
      }

     
      const event = await eventModel.findById(booking.event._id);
      if (event) {
        event.ticketsAvailable += booking.numberOfTickets;
        await event.save();
      }

     
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