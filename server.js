// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

dotenv.config();  // Load environment variables
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes); 
app.use('/api/v1/bookings', bookingRoutes);
<<<<<<< HEAD
app.use('api/v1/',authRoutes); // Use the auth routes

=======
>>>>>>> main

//Connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error(err.message);
  process.exit(1);  // Exit process if connection fails
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
