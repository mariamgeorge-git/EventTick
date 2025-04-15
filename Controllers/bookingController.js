const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Book tickets
const bookTickets = async (req, res) => {
  const { eventId, quantity } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (event.status !== 'approved') return res.status(400).json({ message: 'Event not approved' });

  if (quantity > event.ticketsAvailable) {
    return res.status(400).json({ message: 'Not enough tickets available' });
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

  res.status(201).json(booking);
};

// View user's bookings
const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('event');
  res.json(bookings);
};

// Cancel booking
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  if (String(booking.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const event = await Event.findById(booking.event._id);
  event.ticketsAvailable += booking.quantity;
  event.bookedTickets -= booking.quantity;
  await event.save();

  await booking.remove();
  res.json({ message: 'Booking cancelled' });
};

module.exports = { bookTickets, getUserBookings, cancelBooking };

const Event = require('../models/Event');

// Insufficient Tickets Error
class InsufficientTicketsError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400; // HTTP 400: Bad Request
  }
}
// Check if there are enough tickets
if (event.ticketsAvailable < quantity) {
    return next(new InsufficientTicketsError(`Not enough tickets available for ${event.name}. Only ${event.ticketsAvailable} tickets left.`));
  }

  // Proceed with the booking logic
  event.ticketsAvailable -= quantity;
  await event.save();

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new NotFoundError(`Event with ID ${eventId} not found`));
    }
  // In a real application, you would also store the booking in a Booking model
  res.status(200).json({ message: 'Booking successful', ticketsBooked: quantity });
} catch (error) {
  next(error);
}

module.exports = { bookTickets };
