// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/auth');


dotenv.config();  // Load environment variables
const app = express();

app.use('/api/v1/events', eventRoutes); 
// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/v1/users', userRoutes);

app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/auth', authRoutes); // Use the auth routes


//Connect to mongodb
mongoose.connect("mongodb+srv://robamazen:robamazen@swproj.edqyn7o.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error(err.message);
  process.exit(1);  // Exit process if connection fails
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});