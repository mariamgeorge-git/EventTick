const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token: generateToken(user._id)
  });
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token: generateToken(user._id)
  });
};

// Get profile
const getUserProfile = async (req, res) => {
  const user = req.user;
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

// Update profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    token: generateToken(updatedUser._id)
  });
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
