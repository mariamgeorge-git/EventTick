const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/auth'); // Import the auth routes


dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes); 
app.use('/api/v1/bookings', bookingRoutes);
app.use('api/v1/',authRoutes); // Use the auth routes


//Connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
