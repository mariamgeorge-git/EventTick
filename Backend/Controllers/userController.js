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
const { generateVerificationCode } = require('../utils/codeGenerator');

const userController = {
  createAdminUser: async (req, res) => {
    try {
      const { name, email, password, age } = req.body;

      if (!name || !email || !password || !age) {
        return res.status(400).json({ message: 'Name, email, password, and age are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Create new admin user with explicit role
      const newUser = new User({
        name,
        email,
        password,
        role: 'admin',
        age,
        isActive: true
      });

      // Log the password before saving
      console.log('Creating admin user with password length:', password.length);

      const savedUser = await newUser.save();
      console.log("Admin user created successfully:", {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      });

      res.status(201).json({ 
        message: 'Admin user created successfully',
        userId: savedUser._id
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

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

      // Create new user - password will be hashed by the pre-save hook
      const newUser = new User({
        name,
        email,
        password, // No manual hashing here
        role: role || 'standard_user',
        age,
        isActive: true
      });

      try {
        const savedUser = await newUser.save();
        console.log("User saved successfully:", {
          id: savedUser._id,
          email: savedUser.email,
          isActive: savedUser.isActive
        });
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error("Error saving user:", error);
        throw error;
      }
    } catch (error) {
      console.error('Error registering user:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },

  setupMfa: async (req, res) => {
    try {
      const userId = req.user.userId;
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
      const userId = req.user.userId;
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

      // Find user with all required fields
      console.log('Looking up user with email:', email);
      const user = await User.findOne({ email })
        .select('+password +mfaSecret +mfaCode +mfaCodeExpires');

      console.log('User found in DB:', user); // Log the user object from the database

      console.log('User lookup result:', {
        found: !!user,
        id: user?._id,
        email: user?.email,
        role: user?.role,
        isActive: user?.isActive,
        hasPassword: !!user?.password,
        passwordLength: user?.password?.length
      });

      if (!user) {
        return res.status(404).json({ message: 'Email not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      if (!user.password) {
        console.error('Password field not found in user document');
        return res.status(500).json({ message: 'Internal server error' });
      }

      try {
        console.log('Attempting password comparison for user:', {
          email: user.email,
          role: user.role,
          providedPasswordLength: password?.length,
          storedPasswordLength: user.password?.length
        });
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison details:', {
          isMatch: passwordMatch,
          bcryptVersion: bcrypt.version,
          userRole: user.role
        });
        
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Incorrect password' });
        }
      } catch (error) {
        console.error('Error comparing passwords:', {
          error: error.message,
          stack: error.stack
        });
        return res.status(500).json({ message: 'Error verifying password' });
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

      console.log('Password reset attempt:', {
        email,
        codeProvided: !!verificationCode,
        newPasswordLength: newPassword?.length
      });

      const user = await User.findOne({ email }).select('+password +verificationCode');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User found for password reset:', {
        id: user._id,
        email: user.email,
        role: user.role,
        hasVerificationCode: !!user.verificationCode,
        verificationCodeExpiry: user.verificationCode?.expiresAt
      });

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

      // Let the pre-save middleware handle the password hashing
      user.password = newPassword;
      user.verificationCode = undefined;
      
      console.log('Saving user with new password:', {
        userId: user._id,
        passwordLength: user.password?.length
      });

      await user.save();

      console.log('Password reset successful for user:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      return res.status(200).json({ 
        message: 'Password updated successfully',
        email: user.email // Return email to help with login
      });
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
      const userId = req.params.id || req.user.userId;

      // Log update attempt
      console.log('Profile update attempt:', {
        userId,
        hasFile: !!req.file,
        updates: { ...updates, password: undefined }
      });

      if (updates.age && (updates.age < 18 || updates.age > 100)) {
        return res.status(400).json({ message: 'Age must be between 18 and 100' });
      }

      if (updates.role && !['admin', 'standard_user', 'event_organizer'].includes(updates.role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      // Handle profile image
      if (req.file) {
        // Store the file path or URL in the database
        updates.profileImage = `/uploads/${req.file.filename}`;
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

      res.json({
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          isActive: user.isActive,
          mfaEnabled: user.mfaEnabled,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userIdToDelete = req.params.id; // Get the user ID from parameters
      console.log('Attempting to delete user with ID:', userIdToDelete);

      const user = await User.findByIdAndDelete(userIdToDelete);
      
      if (!user) {
        console.log('User not found for deletion with ID:', userIdToDelete);
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('User deleted successfully:', userIdToDelete);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error); // Log the full error on the backend
      
      // Send a more detailed error message to the frontend
      return res.status(500).json({ 
        message: 'Failed to delete user.', 
        error: error.message // Include the specific backend error message
      });
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
      const userId = req.user.userId;
      console.log('Attempting to fetch bookings for userId:', userId);
      const bookings = await Booking.find({ user: userId })
        .populate('event')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${bookings.length} bookings for userId: ${userId}`, bookings);
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  getUserEvents: async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log('Fetching events for organizer userId:', userId);
      const events = await Event.find({ organizer: userId }).sort({ date: 1 });
      console.log('Found events for organizer:', events.length);
      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  getUserEventsAnalytics: async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log('Fetching analytics for organizer userId:', userId);
      const events = await Event.find({ organizer: userId });
      console.log('Found events for analytics:', events.length);

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
  },

  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      if (!role || !['admin', 'standard_user', 'event_organizer'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: 'User role updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
};
module.exports = userController;
