// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('DB_URI:', process.env.DB_URI);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes); 
app.use('/api/v1/bookings', bookingRoutes);

//Connect to mongodb
const mongoURI = process.env.DB_URI;
if (!mongoURI) {
  console.error('DB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);  // Exit process if connection fails
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
