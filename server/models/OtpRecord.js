const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: String,
    email: String,
    expiresIn: Date,
    isVerified: {type: Boolean, default: false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
