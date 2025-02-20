const mongoose = require("mongoose");

const expensesSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true, 
    },
    staff: {
      type: mongoose.Types.ObjectId,
      ref: "User", 
      required: true, 
    },
    purpose: {
      type: String,
      required: true, 
    },
    status: {type: String, enum: ["pending", 'approved', 'declined'], default: 'pending'},
    verifiedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User", 
    },
    comment: String

  },
  { timestamps: true } 
);

module.exports = mongoose.model("Expenses", expensesSchema);