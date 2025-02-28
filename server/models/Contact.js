const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    message: String,
    reply: String,
    repliedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    replyDate: Date,
    phone: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
