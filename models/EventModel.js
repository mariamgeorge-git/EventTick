const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL or file path of the image
    required: false
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  remainingTickets: {
    type: Number,
    required: true,
    min: 0
  }
});

// Export the model
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
