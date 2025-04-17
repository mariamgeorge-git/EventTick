// const bcrypt = require("bcryptjs");
// const User = require('../models/User');
// const generateToken = require('../utils/generateToken');

// // Register user
// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Validate the input
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Check if the user already exists in the database
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(409).json({ message: 'User already exists' });
//     }

//     // Hash the password before saving it
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     // Save the new user to the database
//     await newUser.save();

//     // Respond with the newly created user and a JWT token
//     res.status(201).json({
//       _id: newUser._id,
//       name: newUser.name,
//       role: newUser.role,
//       token: generateToken(newUser._id)
//     });
//   } catch (err) {
//     console.error('Register error:', err.message);
//     res.status(500).json({ message: 'Server error while registering' });
//   }
// };
// // const jwt = require('jsonwebtoken');
// // const bcrypt = require('bcryptjs');
// // const User = require('../models/User');
// // const secretKey = "your_jwt_secret_key"; // Set your JWT secret key (store securely, e.g., in .env)

// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate the input
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Please enter email and password' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'Email not found' });
//     }

//     // Compare the entered password with the stored hashed password
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(405).json({ message: 'Incorrect password' });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { user: { userId: user._id, role: user.role } },
//       secretKey,
//       { expiresIn: '3h' } // Token expires in 3 hours
//     );

//     // Set the JWT token in a cookie (optional, can be omitted if not using cookies)
//     const expiresAt = new Date(Date.now() + 1800000); // expires in 30 minutes
//     return res
//       .cookie('token', token, {
//         expires: expiresAt,
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', // set to false if testing in development
//         sameSite: 'none',
//       })
//       .status(200)
//       .json({ message: 'Login successful', user });
//   } catch (err) {
//     console.error('Login error:', err.message);
//     res.status(500).json({ message: 'Server error while logging in' });
//   }
// };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // Assuming you're using this utility for JWT generation

const secretKey = "your_jwt_secret_key"; // Set your JWT secret key securely, ideally in a .env file

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate the input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with the newly created user and a JWT token
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      role: newUser.role,
      token: generateToken(newUser._id) // Generate and return the token
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error while registering' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(405).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user: { userId: user._id, role: user.role } },
      secretKey,
      { expiresIn: '3h' } // Token expires in 3 hours
    );

    // Set the JWT token in a cookie (optional)
    const expiresAt = new Date(Date.now() + 1800000); // expires in 30 minutes
    return res
      .cookie('token', token, {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to false if testing locally
        sameSite: 'none',
      })
      .status(200)
      .json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error while logging in' });
  }
};
