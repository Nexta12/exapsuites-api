const mongoose = require("mongoose");
const { UserRole, Gender } = require("../../utils/constants");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    gender: { type: String,  enum: [ Gender.male, Gender.female, Gender.undisclosed], 
      default: Gender.undisclosed },
    profilPic: String,
    email: String,
    password: String, 
    phone: String,
    description: String,
    address: String,
    role: { type: String, enum: [UserRole.superAdmin, UserRole.admin, UserRole.guest, UserRole.manager, ], default: UserRole.guest },
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
