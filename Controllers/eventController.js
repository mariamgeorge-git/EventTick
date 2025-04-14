const Event = require('../models/Event');

// Public: View all approved events
const getEvents = async (req, res) => {
  const events = await Event.find({ status: 'approved' });
  res.json(events);
};

// Public: View single event { // Get Event Details (with error handling if event not found) }
const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// Organizer: Creates event
const createEvent = async (req, res) => {
    const { name, date, location, ticketsAvailable, price } = req.body;
    try {
      const event = new Event({
        name,
        date,
        location,
        ticketsAvailable,
        price,
        organizer: req.user.id,
      });
  
      await event.save();
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Organizer: Update event
const updateEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  // Only event organizer can update
  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updates = ['title', 'description', 'location', 'date', 'ticketsAvailable', 'ticketPrice'];
  updates.forEach(field => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  await event.save();
  res.json(event);
};

// Organizer: Delete event
const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await event.remove();
  res.json({ message: 'Event deleted' });
};

// Organizer: View their own event analytics
const getMyEventAnalytics = async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const analytics = events.map(event => ({
    title: event.title,
    percentBooked: ((event.bookedTickets / event.ticketsAvailable) * 100).toFixed(2)
  }));
  res.json(analytics);
};

// Admin: Approve or reject
const updateEventStatus = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const { status } = req.body;
  if (!['approved', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  event.status = status;
  await event.save();
  res.json({ message: `Event status updated to ${status}` });
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEventAnalytics,
  updateEventStatus
};

//Handling the Event Not Found Error
class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 404; // HTTP 404: Not Found
    }
  }

//  // Get Event Details (with error handling if event not found)
// const getEventById = async (req, res, next) => {
//     const { id } = req.params;
  
//     try {
//       const event = await Event.findById(id);
//       if (!event) {
//         return next(new NotFoundError(`Event with ID ${id} not found`));
//       }
//       res.status(200).json(event);
//     } catch (error) {
//       next(error);
//     }
  module.exports = { createEvent, getEventById }; 
  
