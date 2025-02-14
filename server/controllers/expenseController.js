const Expense = require("../models/Expenses");
module.exports = {
  create: async (req, res) => {
    const { amount, purpose } = req.body;

    try {
      if (!amount || amount === "") {
        return res.status(422).json("Provide Expenditure amount");
      }

      if (!purpose || purpose === "") {
        return res.status(422).json("Provide Purpose of expenditure");
      }

      const expense = await Expense.create({
        amount,
        purpose,
        staff: req.user.id,
      });

      res.status(201).json(expense);
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  getAll: async (req, res) => {
    try {
      const expenses = await Expense.find({})
        .sort({ createdAt: "desc" })
        .populate("staff", "-password -role -bookings -createdAt");

      res.status(200).json(expenses);
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  getOne : async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id)
        .sort({ createdAt: "desc" })
        .populate("staff", "-password -role -bookings -createdAt");

      res.status(200).json(expense);
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;

      await Expense.findByIdAndUpdate(id, { $set: req.body }, { new: true });

      res.status(200).json("Updated");
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  delete: async (req, res) => {
    try {

      const { id } = req.params;

      await Expense.findByIdAndDelete(id);

      res.status(200).json("deleted");
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
};
