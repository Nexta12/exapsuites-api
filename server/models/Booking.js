const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema(
  {
    // Reference to the booked apartment
    apartmentId: { 
      type: mongoose.Types.ObjectId, 
      ref: 'Apartment', 
      required: true 
    },

    // Reference to the user who made the booking
    guestId: { type: String },
    userId: { type: String },
    invoice: { type: String },
    reference: { type: String },

    contactInfo: {
      firstName: { type: String},
      lastName: { type: String},
      gender: { type: String,  enum: ['male', 'female', 'undisclosed'], 
        default: 'undisclosed' },
      email: { type: String },
      address: { type: String },
      phone: { type: String },
      password: { type: String },
    },

    adult: {
        type: String,
        default: 1
    },
    kids: {
        type: String,
        default: 0
    },
    // Booking start date
    startDate: { 
      type: Date, 
      required: true 
    },

    // Booking end date
    endDate: { 
      type: Date, 
      required: true 
    },

    // Total cost for the selected Duration based on Apartment price
    totalPrice: { 
      type: Number, 
      required: true 
    },
    currentPayment: {  // Amount currently been paid considering Instalment payment
      type: Number, 
    },
    totalPayment: {  // Total Sum already been paid by guest considering instalment payment
      type: Number,
    
    },
    totalBalance: {  // Total sum remaining to be paid considering Instalment payment or Extension
      type: Number, 
    },
    // Status of the booking
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'canceled', 'completed', 'expired'], 
      default: 'pending' 
    },

    // Payment status
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'part payment', 'abandoned'], 
      default: 'pending' 
    },

    // Additional notes or requests from the user
    comment: { 
      type: String, 
      trim: true 
    },

    // Cancellation details (if canceled)
    cancellationReason: { 
      type: String, 
      trim: true 
    },

    // Tracking timestamps for cancellations or confirmations
    canceledAt: Date,
    confirmedAt: Date,
    paidAt: Date
  },
  { 
    timestamps: true // Automatically adds `createdAt` and `updatedAt` 
  }
);

// Create the Booking Model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
