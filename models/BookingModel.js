const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Canceled"], 
    default: "Pending" 
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
