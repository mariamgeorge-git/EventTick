
const bookingModel = require("../models/bookingModel");
const eventModel = require("../models/EventModel");

const bookingController = {
  // Book tickets for an event
  createBooking: async (req, res) => {
    try {
      const { eventId, numberOfTickets } = req.body;
      const userId = req.user._id; // Assuming user ID is stored in req.user

      // Check if event exists and has available tickets
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.ticketsAvailable < numberOfTickets) {
        return res.status(400).json({ message: "Not enough tickets available" });
      }

      // Create new booking
      const booking = new bookingModel({
        event: eventId,
        user: userId,
        numberOfTickets,
        totalPrice: event.price * numberOfTickets,
        status: 'confirmed'
      });

      // Update event's available tickets
      event.ticketsAvailable -= numberOfTickets;
      await event.save();

      const newBooking = await booking.save();
      return res.status(201).json(newBooking);
    } catch (error) {
      return res.status(400).json({ message: error.message });
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
