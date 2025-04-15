const Booking = require('../models/BookingModel');
const Event = require('../models/EventModel');

// Book tickets : Missing input, invalid quantity, event not found, event not approved, overbooking
const bookTickets = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid event ID and quantity are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event is not approved for booking' });
    }

    if (quantity > event.ticketsAvailable) {
      return res.status(400).json({
        message: `Not enough tickets available. Only ${event.ticketsAvailable} left.`
      });
    }

    const totalPrice = quantity * event.ticketPrice;

    const booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      quantity,
      totalPrice
    });

    event.ticketsAvailable -= quantity;
    event.bookedTickets += quantity;
    await event.save();

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    console.error('Book Tickets Error:', error.message);
    res.status(500).json({ message: 'Server error while booking tickets' });
  }
};



// View user's bookings : DB failure or query error
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('event');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error.message);
    res.status(500).json({ message: 'Error retrieving your bookings' });
  }
};


// Cancel booking : Booking not found, user unauthorized, event not found, DB save/remove errors
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const event = await Event.findById(booking.event._id);
    if (!event) {
      return res.status(404).json({ message: 'Associated event not found' });
    }

    event.ticketsAvailable += booking.quantity;
    event.bookedTickets -= booking.quantity;
    await event.save();

    await booking.remove();

    res.json({ message: 'Booking cancelled and tickets restored' });
  } catch (error) {
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
};

module.exports = {
  bookTickets,
  getUserBookings,
  cancelBooking
};
