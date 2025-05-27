const Event = require('../models/EventModel');

const eventController = {
  
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

  
  createEvent: async (req, res) => {
    try {
      const { title, description, date, location, ticketsAvailable, Price } = req.body;

      
      const event = new Event({
        title,
        description,
        date,
        location,
        ticketsAvailable: parseInt(ticketsAvailable),
        Price: parseFloat(Price),
        organizer: req.user.userId,
        status: 'pending' 
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

  
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      
      const isAdmin = req.user.role === 'admin';
      const isEventOrganizer = req.user.role === 'event_organizer';
      const isEventOwner = String(event.organizer) === String(req.user._id);

      
      if (!isAdmin && !(isEventOrganizer && isEventOwner)) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      
      const updates = { ...req.body };

      
      if (updates.status && !['approved', 'pending', 'cancelled'].includes(updates.status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      
      Object.assign(event, updates);
      await event.save();

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      console.error('Update Event Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: error.message
      });
    }
  },

  
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      
      if (req.user.role !== 'admin' && req.user.role !== 'event_organizer') {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await Event.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Delete Event Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error deleting event',
        error: error.message
      });
    }
  },

  
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

  
  updateEventStatus: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      console.log('Fetched event data in updateEventStatus:', event);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const { status } = req.body;
      if (!['approved', 'cancelled'].includes(status)) {
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