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
  organizer:
   { type: mongoose.Schema.Types.ObjectId, ref: 'User', 
    required: true },
  image: {
    type: String,
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
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
