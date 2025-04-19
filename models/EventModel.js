const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Event date must be in the future"
    }
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled'],
    default: 'pending'
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
    min: [1, "Capacity must be at least 1"]
  },
  TicketAvailable: {
    type: Number,
    required: true, //lazm tkon true bs it wouldnt work gher keda hahsouf baaden 
    min: 0
  },
  Price: {
    type: Number,
    required:true, //lazm tkon true bs it wouldnt work gher keda hahsouf baaden 
    min: [0, "Price cannot be negative"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
eventSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;