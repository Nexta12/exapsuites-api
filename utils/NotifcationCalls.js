const Notifications = require("../server/models/Notifications");

module.exports = {
  createNotification: async (title, message) => {
    try {
      const notification = await Notifications.create({ title, message });
      return { success: true, data: notification };
    } catch (error) {
      console.error("Error creating notification:", error.message);
      return { success: false, error: error.message };
    }
  },
};
