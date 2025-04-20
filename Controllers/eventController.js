const Event = require('../models/EventModel');

const eventController = {
  // Public: View all approved events
  getApprovedEvents: async (req, res) => {
    try {
      const events = await Event.find({ status: 'approved' })
        .populate('organizer', 'name email')
        .select('-__v');
      return res.status(200).json(events);
    } catch (error) {
      console.error('Get Approved Events Error:', error.message);
      return res.status(500).json({ message: 'Error retrieving approved events' });
    }
  },

  // Admin: View all events (including pending and declined)
  getEvents: async (req, res) => {
    try {
      const events = await Event.find()
        .populate('organizer', 'name email')
        .select('-__v');
      return res.status(200).json(events);
    } catch (error) {
      console.error('Get All Events Error:', error.message);
      return res.status(500).json({ message: 'Error retrieving events' });
    }
  },

  // Public: View single event
  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizer', 'name email');
      if (!event) return res.status(404).json({ message: 'Event not found' });
      return res.status(200).json(event);
    } catch (error) {
      console.error('Get Event By ID Error:', error.message);
      return res.status(500).json({ message: 'Error retrieving event' });
    }
  },

  // Create a new event (Event Organizer)
  createEvent: async (req, res) => {
    try {
      const { title, description, date, location, capacity, ticketsAvailable, price } = req.body;

      // Create new event
      const event = new Event({
        title,
        description,
        date,
        location,
        capacity: parseInt(capacity),
        ticketsAvailable: parseInt(ticketsAvailable || capacity),
        price: parseFloat(price),
        organizer: req.user._id,
        status: 'pending' // Default status for new events
      });

      const newEvent = await event.save();
      return res.status(201).json({
        success: true,
        data: newEvent
      });
    } catch (error) {
      console.error('Create Event Error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error creating event' });
    }
  },

  // Organizer: Update event
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      // Check if user is organizer or admin
      const isAdmin = req.user.role === 'admin';
      const isOrganizer = String(event.organizer) === String(req.user._id);

      if (!isAdmin && !isOrganizer) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      // Determine which fields can be updated based on role
      let updatableFields = ['title', 'description', 'location', 'date', 'capacity', 'ticketsAvailable', 'price'];
      if (isAdmin) {
        updatableFields.push('status');
        // Validate status if it's being updated
        if (req.body.status && !['approved', 'pending', 'declined'].includes(req.body.status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }
      }

      // Update allowed fields
      updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
          // Parse numbers for numeric fields
          if (['capacity', 'ticketsAvailable'].includes(field)) {
            event[field] = parseInt(req.body[field]);
          } else if (field === 'price') {
            event[field] = parseFloat(req.body[field]);
          } else {
            event[field] = req.body[field];
          }
        }
      });

      await event.save();
      return res.status(200).json({ event, msg: 'Event updated successfully' });
    } catch (error) {
      console.error('Update Event Error:', error.message);
      return res.status(500).json({ message: 'Error updating event' });
    }
  },

  // Organizer: Delete event
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      if (String(event.organizer) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await Event.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Event deleted' });
    } catch (error) {
      console.error('Delete Event Error:', error.message);
      return res.status(500).json({ message: 'Error deleting event' });
    }
  },

  // Organizer: View own event analytics
  getMyEventAnalytics: async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id });
      const analytics = events.map(event => ({
        name: event.title,
        capacity: event.capacity,
        ticketsAvailable: event.ticketsAvailable,
        ticketsSold: event.capacity - event.ticketsAvailable,
        percentBooked: ((event.capacity - event.ticketsAvailable) / event.capacity * 100).toFixed(2)
      }));
      return res.status(200).json(analytics);
    } catch (error) {
      console.error('Analytics Error:', error.message);
      return res.status(500).json({ message: 'Error generating analytics' });
    }
  },

  // Admin: Approve or Reject event
  updateEventStatus: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const { status } = req.body;
      if (!['approved', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      event.status = status;
      await event.save();

      return res.status(200).json({ message: `Event status updated to ${status}` });
    } catch (error) {
      console.error('Update Event Status Error:', error.message);
      return res.status(500).json({ message: 'Error updating event status' });
    }
  }
};

module.exports = eventController;