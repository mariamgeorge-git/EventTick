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

  setupMfa: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).select('+mfaSecret +mfaCode +mfaCodeExpires');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a random secret for MFA
      const mfaSecret = crypto.randomBytes(20).toString('hex');
      
      // Generate setup code
      const setupCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      console.log('Generated setup code:', setupCode); // For debugging
      
      // Send verification email
      try {
        const emailResult = await sendVerificationEmail(user.email, setupCode);
        console.log('Email service response:', emailResult);

        if (!emailResult.success) {
          return res.status(500).json({ message: 'Failed to send verification email' });
        }

        // Save MFA data only after successful email send/simulation
        user.mfaSecret = mfaSecret;
        user.mfaEnabled = false;
        user.mfaSetupCode = setupCode;
        user.mfaSetupCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.save();
        console.log('User saved with MFA setup data');

        return res.status(200).json({
          message: 'MFA setup initiated. Please check your email for the setup code.',
          requiresVerification: true
        });
      } catch (error) {
        console.error('Error in MFA setup process:', error);
        return res.status(500).json({ 
          message: 'Failed to setup MFA. Please try again.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } catch (error) {
      console.error('Error in setupMfa:', error);
      return res.status(500).json({ 
        message: 'Server error during MFA setup',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  verifyMfaSetup: async (req, res) => {
    try {
      const { setupCode } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId).select('+mfaSecret +mfaSetupCode +mfaSetupCodeExpires');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Verifying setup code:', {
        provided: setupCode,
        stored: user.mfaSetupCode,
        expires: user.mfaSetupCodeExpires
      });

      if (!user.mfaSetupCode || !user.mfaSetupCodeExpires) {
        return res.status(400).json({ message: 'MFA setup not initiated or expired' });
      }

      if (new Date() > user.mfaSetupCodeExpires) {
        return res.status(400).json({ message: 'MFA setup code expired' });
      }

      if (user.mfaSetupCode !== setupCode) {
        return res.status(400).json({ message: 'Invalid setup code' });
      }

      // Enable MFA
      user.mfaEnabled = true;
      user.mfaSetupCode = undefined;
      user.mfaSetupCodeExpires = undefined;
      
      try {
        await user.save();
        console.log('MFA setup completed successfully');
      } catch (saveError) {
        console.error('Error saving user after MFA verification:', saveError);
        return res.status(500).json({ message: 'Failed to complete MFA setup' });
      }

      return res.status(200).json({ 
        message: 'MFA setup completed successfully',
        mfaEnabled: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfaEnabled
        }
      });
    } catch (error) {
      console.error('Error verifying MFA setup:', error);
      return res.status(500).json({ message: 'Server error during MFA verification' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
      }

      // Find user with all MFA fields
      const user = await User.findOne({ email, isActive: true })
        .select('+password +mfaSecret +mfaCode +mfaCodeExpires');

      console.log('Found user:', {
        id: user?._id,
        mfaEnabled: user?.mfaEnabled,
        hasMfaSecret: !!user?.mfaSecret
      });

      if (!user) {
        return res.status(404).json({ message: 'Email not found or account is inactive' });
      }

      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return res.status(405).json({ message: 'Incorrect password' });
      }

      // Check if MFA is enabled
      if (user.mfaEnabled) {
        console.log('MFA is enabled for user, generating code...');
        
        // Generate MFA code
        const mfaCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        console.log('Generated MFA code:', mfaCode);
        
        // Save MFA code and expiry directly to the database
        const result = await User.updateOne(
          { _id: user._id },
          { 
            $set: {
              mfaCode: mfaCode,
              mfaCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
          }
        );

        console.log('Database update result:', result);

        if (result.modifiedCount !== 1) {
          console.error('Failed to save MFA code');
          return res.status(500).json({ message: 'Failed to generate MFA code' });
        }

        // Send MFA code via email
        try {
          await sendVerificationEmail(user.email, `Your login verification code is: ${mfaCode}`);
          console.log('Sent MFA code email successfully');
        } catch (emailError) {
          console.error('Error sending MFA email:', emailError);
          return res.status(500).json({ message: 'Failed to send MFA code' });
        }

        // Return temporary token for MFA verification
        const tempToken = jwt.sign(
          { 
            tempAuth: true,
            userId: user._id,
            mfaRequired: true,
            email: user.email
          },
          process.env.JWT_SECRET || 'mytenomk',
          { expiresIn: '10m' }
        );

        console.log('Generated temp token for MFA verification');

        return res.status(200).json({
          message: 'MFA code sent to your email',
          mfaRequired: true,
          tempToken
        });
      }

      // If MFA not enabled, proceed with normal login
      const token = jwt.sign(
        { 
          user: { 
            userId: user._id, 
            role: user.role,
            mfaVerified: false 
          }
        },
        process.env.JWT_SECRET || 'mytenomk',
        { expiresIn: '3h' }
      );

      return res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          expires: new Date(Date.now() + 3 * 60 * 60 * 1000)
        })
        .status(200)
        .json({ 
          message: 'Login successful',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mfaEnabled: user.mfaEnabled
          },
          token
        });

    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyMfaCode: async (req, res) => {
    try {
      const { mfaCode, tempToken } = req.body;
      console.log('MFA verification attempt:', {
        hasMfaCode: !!mfaCode,
        hasTempToken: !!tempToken
      });

      if (!mfaCode || !tempToken) {
        return res.status(400).json({ message: 'MFA code and temporary token are required' });
      }

      // Verify temp token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'mytenomk');
        console.log('Decoded temp token:', {
          tempAuth: decoded.tempAuth,
          userId: decoded.userId,
          email: decoded.email
        });
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      if (!decoded.tempAuth || !decoded.userId) {
        console.log('Invalid token data:', decoded);
        return res.status(401).json({ message: 'Invalid temporary token' });
      }

      // Find user with all required fields
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('User not found with ID:', decoded.userId);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Found user for MFA verification:', {
        id: user._id,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
        hasMfaCode: !!user.mfaCode,
        mfaCode: user.mfaCode,
        providedCode: mfaCode,
        mfaCodeExpires: user.mfaCodeExpires,
        currentTime: new Date()
      });

      // Validate MFA is still enabled
      if (!user.mfaEnabled) {
        console.log('MFA is not enabled for user');
        return res.status(400).json({ message: 'MFA is not enabled for this user' });
      }

      // Use the validateMfaCode method
      if (!user.validateMfaCode(mfaCode)) {
        console.log('MFA validation failed');
        return res.status(400).json({ message: 'MFA code not requested or expired' });
      }

      // Clear MFA code and expiry
      await User.updateOne(
        { _id: user._id },
        { 
          $set: {
            mfaCode: null,
            mfaCodeExpires: null
          }
        }
      );
      console.log('Cleared MFA code after successful verification');

      // Generate final authentication token
      const token = jwt.sign(
        { 
          user: { 
            userId: user._id, 
            role: user.role,
            mfaVerified: true 
          }
        },
        process.env.JWT_SECRET || 'mytenomk',
        { expiresIn: '3h' }
      );

      console.log('MFA verification successful, generated new token');

      return res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          expires: new Date(Date.now() + 3 * 60 * 60 * 1000)
        })
        .status(200)
        .json({ 
          message: 'MFA verified successfully',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mfaEnabled: user.mfaEnabled
          },
          token
        });
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(500).json({ message: 'Server error during MFA verification' });
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
      const userId = req.params.id || req.user._id;  // Get ID from URL params or authenticated user

      if (updates.age && (updates.age < 18 || updates.age > 100)) {
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }
  
      if (updates.role && !['admin', 'standard_user', 'event_organizer'].includes(updates.role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
  
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
  
      const user = await User.findByIdAndUpdate(
        userId,
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
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const userId = req.user._id;
      const bookings = await Booking.find({ user: userId })
        .populate('event')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(bookings);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserEvents: async (req, res) => {
    try {
      const userId = req.user._id;
      const events = await Event.find({ organizer: userId }).sort({ date: 1 });
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserEventsAnalytics: async (req, res) => {
    try {
      const userId = req.user._id;
      const events = await Event.find({ organizer: userId });
      
      const analytics = await Promise.all(events.map(async (event) => {
        const bookings = await Booking.find({ event: event._id });
        const totalTicketsSold = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
        const revenue = totalTicketsSold * event.ticketPrice;
        
        return {
          eventId: event._id,
          eventName: event.title,
          totalTickets: event.ticketsAvailable,
          ticketsSold: totalTicketsSold,
          revenue: revenue
        };
      }));
      
      return res.status(200).json(analytics);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
module.exports = userController;
