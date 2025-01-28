const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({

  title: String, 
  message: String,
  status: {type: Boolean, default: false}

},{timestamps: true})


module.exports = mongoose.model("Notification", notificationSchema);