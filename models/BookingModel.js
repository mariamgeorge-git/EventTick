const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({

    totalPrice: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  numTickets: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Canceled"], 
    default: "Pending" 
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);

module.exports = mongoose.model("Booking", BookingSchema);
