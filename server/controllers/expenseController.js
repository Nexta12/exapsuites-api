const { AdminMessageEmail } = require("../../utils/emailCalls");
const { DateFormatter } = require("../../utils/helpers");
const { createNotification } = require("../../utils/NotifcationCalls");
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
      // Send Message To manager for approval
      AdminMessageEmail(`A New Expense Record, A new expense record  has been created by: ${req.user.firstName} ${req.user.lastName}: Amount: ₦ ${amount.toLocaleString()}`)
      // Create Dashboard Notification
      await createNotification('A new Expense Record', ` A new expense record of ${amount} for ${purpose} has been created by ${req.user.firstName}  ${req.user.lastName} waiting for approval. Date: ${DateFormatter(Date.now())} ` )

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
      .populate([
        { path: "staff", select: "-password -role -bookings -createdAt" },
        { path: "verifiedBy", select: "-password -role -bookings -createdAt" }
      ]);

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
      const expense = await Expense.findById(id)
      const {  amount,
        purpose, comment, status} = req.body

      await Expense.findByIdAndUpdate(id, { $set: {
        amount,
        purpose,
        comment,
        status,
        verifiedBy: req.user.id
      } }, { new: true });

      await createNotification(`Expense ${status}`, ` An expense record of ${expense.amount} for ${expense.purpose} has been ${status} by ${req.user.firstName}  ${req.user.lastName}. Date: ${DateFormatter(Date.now())} ` )

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
