const cronRouter = require("express").Router();
const cron = require("node-cron");
const Bookings = require('../models/Booking');

const updateExpiredBookings = async () => {
  try {
    // Find all bookings that have expired
    const expiredBookings = await Bookings.find({ endDate: { $lte: new Date() }, status: { $ne: 'expired' } });

    // If there are expired bookings, update their status in bulk
    if (expiredBookings.length > 0) {
      const bulkOps = expiredBookings.map(booking => ({
        updateOne: {
          filter: { _id: booking._id },
          update: { $set: { status: 'expired' } }
        }
      }));

      await Bookings.bulkWrite(bulkOps);
      console.log(`Updated ${expiredBookings.length} bookings to expired status.`);
    } else {
      console.log('No expired bookings found.');
    }
  } catch (error) {
    console.error('Error updating expired bookings:', error);
  }
};

// Schedule the cron job to run every 10 minutes
cron.schedule("*/10 * * * *", updateExpiredBookings);


module.exports = cronRouter;