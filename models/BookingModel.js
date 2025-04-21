const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  numberOfTickets: {
    type: Number,
    required: [true, "Number of tickets is required"],
    min: [1, "Must book at least 1 ticket"]
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  cancellationDate: {
    type: Date
  }
}, { timestamps: true });

bookingSchema.index({ event: 1, user: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
