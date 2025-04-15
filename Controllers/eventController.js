const Event = require('../models/EventModel');

// Public: View all approved events :	DB errors
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' });
    res.json(events);
  } catch (error) {
    console.error('Get Events Error:', error.message);
    res.status(500).json({ message: 'Error retrieving events' });
  }
};

// Public: View single event : Missing or invalid ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error('Get Event By ID Error:', error.message);
    res.status(500).json({ message: 'Error retrieving event' });
  }
};

// Organizer: Create event: Validation, DB errors
const createEvent = async (req, res) => {
  try {
    const { title, date, location, ticketsAvailable, ticketPrice, description } = req.body;

    if (!title || !date || !location || !ticketsAvailable || !ticketPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = new Event({
      title,
      date,
      location,
      ticketsAvailable,
      ticketPrice,
      description,
      organizer: req.user._id,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create Event Error:', error.message);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Organizer: Update event : Authorization, missing fields
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only event organizer can update
    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatableFields = ['title', 'description', 'location', 'date', 'ticketsAvailable', 'ticketPrice'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Update Event Error:', error.message);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Organizer: Delete event : Authorization, not found
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete Event Error:', error.message);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

// Organizer: View own event analytics : Math safety, DB error
const getMyEventAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const analytics = events.map(event => ({
      title: event.title,
      percentBooked: event.ticketsAvailable + event.bookedTickets === 0
        ? '0.00'
        : ((event.bookedTickets / (event.ticketsAvailable + event.bookedTickets)) * 100).toFixed(2)
    }));
    res.json(analytics);
  } catch (error) {
    console.error('Analytics Error:', error.message);
    res.status(500).json({ message: 'Error generating analytics' });
  }
};

// Admin: Approve or Reject event : Invalid status, not found
const updateEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { status } = req.body;
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    event.status = status;
    await event.save();

    res.json({ message: `Event status updated to ${status}` });
  } catch (error) {
    console.error('Update Event Status Error:', error.message);
    res.status(500).json({ message: 'Error updating event status' });
  }
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
