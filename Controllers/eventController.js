const Event = require('../models/EventModel');

const eventController = {
  // Public: View all events
  getEvents: async (req, res) => {
    try {
      const events = await Event.find()
        .populate('organizer', 'name email') // Include organizer details
        .select('-__v'); // Exclude version key
      return res.status(200).json(events);
    } catch (error) {
      console.error('Get Events Error:', error.message);
      return res.status(500).json({ message: 'Error retrieving events' });
    }
  },

  // Public: View single event
  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      return res.status(200).json(event);
    } catch (error) {
      console.error('Get Event By ID Error:', error.message);
      return res.status(500).json({ message: 'Error retrieving event' });
    }
  },

  // Organizer: Create event
  createEvent: async (req, res) => {
    try {
      const { name, date, location, ticketsAvailable, ticketPrice, description } = req.body;

      if (!name || !date || !location || !ticketsAvailable || !ticketPrice) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const event = new Event({
        name,
        date,
        location,
        ticketsAvailable,
        ticketPrice,
        description,
        organizer: req.user._id,
        status: 'pending' // Default status for new events
      });

      await event.save();
      return res.status(201).json(event);
    } catch (error) {
      console.error('Create Event Error:', error.message);
      return res.status(500).json({ message: 'Error creating event' });
    }
  },

  // Organizer: Update event
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      // Only event organizer can update
      if (String(event.organizer) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      const updatableFields = ['name', 'description', 'location', 'date', 'ticketsAvailable', 'ticketPrice'];
      updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
          event[field] = req.body[field];
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
        name: event.name,
        percentBooked: event.ticketsAvailable + event.bookedTickets === 0
          ? '0.00'
          : ((event.bookedTickets / (event.ticketsAvailable + event.bookedTickets)) * 100).toFixed(2)
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
  },

//   // Get list of all events (Public)
//   getAllEvents: async (req, res) => {
//     try {
//         const events = await Event.find();
//         return res.status(200).json(events);
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// },

  // Get details of a single event (Public)
  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.status(200).json(event);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Create a new event (Event Organizer)
  createEvent: async (req, res) => {
    try {
      const event = new Event({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        organizer: req.user._id, // Assuming user ID is stored in req.user
        status: 'pending', // Default status
        capacity: req.body.capacity,
        price: req.body.price
      });

      const newEvent = await event.save();
      return res.status(201).json(newEvent);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  // Update an event (Event Organizer or Admin)
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if user is organizer or admin
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this event" });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      return res.status(200).json({ 
        event: updatedEvent, 
        message: "Event updated successfully" 
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Delete an event (Event Organizer or Admin)
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if user is organizer or admin
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this event" });
      }

      await Event.findByIdAndDelete(req.params.id);
      return res.status(200).json({ 
        message: "Event deleted successfully" 
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = eventController;