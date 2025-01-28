const Notification = require("../models/Notifications");

module.exports = {
  getAll: async (req, res) => {
    try {
     const notifications = await Notification.find().sort({createAt: 'desc'});

      res.send(notifications );
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ID
      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }
  
      // Update the notification status
      const notification = await Notification.findByIdAndUpdate(
        id,
        { $set: { status: true } },
        { new: true } // Return the updated document
      );
  
      // Check if the notification exists
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
  
      // Respond with the updated notification
      res.status(200).json({ message: "Notification updated successfully", data: notification });
    } catch (error) {
      console.error("Error updating notification:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
  delete: async (req, res) => {
    try {
      await Notification.findByIdAndDelete(req.params.id);

      res.send("Deleted");
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
};
