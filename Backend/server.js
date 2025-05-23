const dotenv = require('dotenv');
dotenv.config();

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userController = require('./Controllers/userController');

// dotenv.config();  
// console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
// console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes); 
app.use('/api/v1/bookings', bookingRoutes);
app.post('/api/v1/login', userController.login);
app.post('/api/v1/register', userController.register);
app.post('/api/v1/forgetpassword', userController.forgetPassword);
app.post('/api/v1/verifyresetpassword', userController.verifyAndResetPassword);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error(err.message);
  process.exit(1);  
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});