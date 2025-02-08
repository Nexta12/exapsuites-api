const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    snippet: String,
    maxPeople: String,
    totalRooms: String,
    totalBeds: String,
    totalKitchens: String,
    totalBathrooms: String,
    totalBalcony: String,
    totalParlour: String,
    price: Number,
    images: [{url: String}],
    bookingStatus: { 
      type: String, 
      enum: ['Booking Initiated', 'confirmed', 'occupied', 'free'], 
      default: 'free' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apartment", apartmentSchema);
