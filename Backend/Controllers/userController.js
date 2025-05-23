const User = require('../models/User');
const Event = require('../models/EventModel');
const Booking = require('../models/BookingModel');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, age } = req.body;

      if (!name || !email || !password || !age) {
        return res.status(400).json({ message: 'Name, email, password, and age are required' });
      }

      if (age < 18 || age > 100) {
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      if (role && !['admin', 'standard_user', 'event_organizer'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'standard_user',
        age,
        isActive: true
      });

      try {
        await newUser.save();
        console.log("User saved:", newUser);
      } catch (error) {
        console.error("Error saving user:", error);
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

      if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
      }

      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'Email not found or account is inactive' });
      }

      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return res.status(405).json({ message: 'Incorrect password' });
      }

      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 1800000);

      const token = jwt.sign(
        { user: { userId: user._id, role: user.role } },
        secretKey,
        { expiresIn: '3h' }
      );

      // Send both cookie and token in response
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
          token // Include token in response body
        });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  forgetPassword: async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.verificationCode = {
        code: verificationCode,
        expiresAt
      };
      await user.save();

      await sendVerificationEmail(email, verificationCode);
  
      return res.status(200).json({ 
        message: 'Verification code sent to your email',
        email: email
      });
    } catch (error) {
      console.error('Error in forget password:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  verifyAndResetPassword: async (req, res) => {
    try {
      const { email, verificationCode, newPassword } = req.body;

      if (!email || !verificationCode || !newPassword) {
        return res.status(400).json({ 
          message: 'Email, verification code, and new password are required' 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.verificationCode || !user.verificationCode.code) {
        return res.status(400).json({ 
          message: 'No verification code found. Please request a new one.' 
        });
      }

      if (user.verificationCode.code !== verificationCode) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      if (new Date() > user.verificationCode.expiresAt) {
        return res.status(400).json({ 
          message: 'Verification code has expired. Please request a new one.' 
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.verificationCode = undefined;
      await user.save();

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error in verify and reset password:', error);
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
      const userId = req.params.id || req.user._id; // Use URL param if available, otherwise use authenticated user's ID

      // Validate age if provided
      if (updates.age && (updates.age < 18 || updates.age > 100)) {
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }
  
      if (updates.role && !['admin', 'standard_user', 'event_organizer'].includes(updates.role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      // Only admin can update roles
      if (updates.role && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can update user roles' });
      }

      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      // If not admin and trying to update another user
      if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update other users' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      // If no user is found
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send successful response
      return res.status(200).json({ user, msg: 'User updated successfully' });
    } catch (error) {
      // Handle validation error
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      // Handle any other errors
      return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      // req.user is set by the authenticateToken middleware
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error('Get Current User Error:', error);
      return res.status(500).json({ message: 'Error retrieving user profile' });
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