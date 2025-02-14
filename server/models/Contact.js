const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({

  fullName: String, 
  email: String,
  message: String,
  phone: String,
  isRead: {type: Boolean, default: false}

},{timestamps: true})


module.exports = mongoose.model("Contact", contactSchema);