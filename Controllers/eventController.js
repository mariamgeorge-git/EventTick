const Event = require('../models/EventModel');

const eventController = {
  // Get list of all events (Public)
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.find();
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

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
      const eventData = {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        organizer: req.user._id,
        status: req.body.status || 'pending',
        capacity: req.body.capacity,
        price: req.body.price,
        ticketsAvailable: req.body.ticketsAvailable || req.body.capacity // Use capacity if ticketsAvailable not provided
      };

      const event = new Event(eventData);
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
  },

  // Get analytics for organizer's events
  getMyEventAnalytics: async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id });
      const analytics = events.map(event => ({
        title: event.title,
        percentBooked: ((event.capacity - event.ticketsAvailable) / event.capacity * 100).toFixed(2)
      }));
      return res.status(200).json(analytics);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Update event status (Admin only)
  updateEventStatus: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const { status } = req.body;
      if (!['approved', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      event.status = status;
      await event.save();

      return res.status(200).json({ 
        message: `Event status updated to ${status}` 
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = eventController;