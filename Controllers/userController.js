const User = require('../models/User');
const Booking = require('../models/BookingModel');
const Event = require('../models/EventModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const bcrypt = require('bcryptjs');

const userController = {
  register: async (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      const { name, email, password, role, age } = req.body;

      // Validate required fields
      if (!name || !email || !password || !age) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Name, email, password, and age are required' });
      }

      // Validate age
      if (age < 18 || age > 100) {
        console.log('Invalid age:', age);
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists with email:', email);
        return res.status(409).json({ message: 'User already exists' });
      }

      // Validate role if provided
      if (role && !['admin', 'standard_user', 'event_organizer'].includes(role)) {
        console.log('Invalid role specified:', role);
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');

      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'standard_user',
        age,
        isActive: true
      });

      console.log('Attempting to save user:', { name, email, role, age });
      
      // Save the user to the database
      try {
        await newUser.save();
        console.log("User saved successfully:", newUser._id);
      } catch (error) {
        console.error("Error saving user:", error);
        throw error; // Re-throw to be caught by outer catch
      }

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate the input
      if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
      }

      // Find the user by email and check if active
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'Email not found or account is inactive' });
      }

      // Check if the password is correct
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return res.status(405).json({ message: 'Incorrect password' });
      }

      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 1800000); // expire in 30 minutes

      // Generate JWT token
      const token = jwt.sign(
        { user: { userId: user._id, role: user.role } },
        secretKey,
        { expiresIn: '3h' }
      );

      return res
        .cookie('token', token, {
          expires: expiresAt,
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        })
        .status(200)
        .json({ 
          message: 'Login successful', 
          user,
          token // Include token in response
        });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  forgetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      // Validate input
      if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user's password
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error in forget password:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const updates = { ...req.body };
      
      // Validate age if provided
      if (updates.age && (updates.age < 18 || updates.age > 100)) {
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }

      // Validate role if provided
      if (updates.role && !['admin', 'standard_user', 'event_organizer'].includes(updates.role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ user, msg: 'User updated successfully' });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ user, msg: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user data',
        error: error.message
      });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('event')
        .sort({ bookingDate: -1 });
      
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  getUserEvents: async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id });
      
      return res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      console.error('Error getting user events:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving events',
        error: error.message
      });
    }
  },

  getUserEventsAnalytics: async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id });
      const bookings = await Booking.find({ event: { $in: events.map(e => e._id) } });

      const analytics = {
        totalEvents: events.length,
        totalRevenue: 0,
        totalBookings: bookings.length,
        eventsAnalytics: events.map(event => {
          const eventBookings = bookings.filter(b => b.event.toString() === event._id.toString());
          const revenue = eventBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
          const bookedTickets = eventBookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
          
          return {
            eventId: event._id,
            title: event.title,
            status: event.status,
            capacity: event.capacity,
            ticketsSold: bookedTickets,
            ticketsAvailable: event.ticketsAvailable,
            occupancyRate: ((bookedTickets / event.capacity) * 100).toFixed(2) + '%',
            revenue: revenue,
            averageTicketPrice: event.price,
            date: event.date
          };
        })
      };

      // Calculate total revenue
      analytics.totalRevenue = analytics.eventsAnalytics.reduce((sum, event) => sum + event.revenue, 0);

      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting user events analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving events analytics',
        error: error.message
      });
    }
  }
};
module.exports = userController;