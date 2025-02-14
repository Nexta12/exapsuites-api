const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    gender: { type: String,  enum: ['male', 'female', 'undisclosed'], 
      default: 'undisclosed' },
    profilPic: String,
    email: String,
    password: String, 
    phone: String,
    description: String,
    address: String,
    role: { type: String, enum: ['Super Admin', 'Admin', 'Guest',], default: "Guest" },
    bookings: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        status: { type: String, enum: ["pending", "confirmed", "completed", "canceled"], required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
