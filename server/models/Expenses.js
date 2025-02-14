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
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Expenses", expensesSchema);