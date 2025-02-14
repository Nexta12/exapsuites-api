const Booking = require("../models/Booking");
const Apartment = require("../models/Apartment");
const { v4: uuidv4 } = require("uuid");
const calculateTotalPrice = require("../../utils/BookingCalculater");
const mongoose = require("mongoose");
const User = require("../models/User");
const { generateInvoice, DateFormatter } = require("../../utils/helpers");
const {
  initializePayment,
  verifyPayment,
} = require("../../utils/paystackGateway");
const {
  BookingSuccessEmail,
  AdminMessageEmail,
} = require("../../utils/emailCalls");

module.exports = {
  BookApartment: async (req, res) => {
    const { apartmentId } = req.params;
    const { startDate, endDate, comment, adult, kids } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
        return res.status(400).json("Invalid apartment ID");
      }

      // Check if guestId cookie already exists
      let guestId = req.cookies.guestId;

      if (!guestId) {
        // Generate a new guestId if none exists
        guestId = uuidv4();

        // Set the guestId cookie with a 30-day expiry
        res.cookie("guestId", guestId, {
          httpOnly: true, // Prevent access via JavaScript
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          secure: process.env.NODE_ENV === "production", // Secure only in production
          sameSite: "strict", // Prevent cross-site request forgery
        });
      }

      // Get the apartment details and availability
      const apartmentToBook = await Apartment.findById(apartmentId);

      if (!apartmentToBook) {
        return res.status(404).json("Apartment not found");
      }

      if (apartmentToBook.bookingStatus !== "free") {
        return res
          .status(400)
          .json("This apartment is not available for booking");
      }

      // Calculate total price based on cost per night
      const totalPrice = calculateTotalPrice(
        startDate,
        endDate,
        apartmentToBook.price
      );

      // Create the new booking
      const newBooking = await Booking.create({
        guestId,
        apartmentId,
        startDate,
        endDate,
        totalPrice,
        comment,
        adult,
        kids,
        status: "pending",
      });

      // Update apartment's booking status to "booked"
      apartmentToBook.bookingStatus = "Booking Initiated";
      await apartmentToBook.save();

      res.status(201).json(newBooking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  ConfirmBooking: async (req, res) => {
    const { bookingId } = req.params;

    const { firstName, lastName, gender, email, phone, password, address } = req.body;

    try {
      // get the booking details

      const reservedBooking = await Booking.findById(bookingId);
      if (!reservedBooking) {
        return res.status(404).json("Reservation not found ");
      }

      if (reservedBooking.status !== "pending") {
        return res.status(422).json("This booking has already been confirmed");
      }

      // Extract the guestId from the reservation and verify it with client guestId in cookies
      // Verify guestId from cookies matches the booking's guestId
      if (req.cookies.guestId !== reservedBooking.guestId) {
        return res.status(403).json("Unauthorized: Reservation mismatch");
      }

      // Check if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          gender,
          phone,
          password,
          address,
        });
      }

      // Update booking with user reference and contact info
      reservedBooking.contactInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        address: user.address,
      };
      reservedBooking.userId = user._id; // Link the booking to the user
      reservedBooking.status = "confirmed";
      await reservedBooking.save();

      // Add the booking to the user's bookings array
      const bookingEntry = {
        bookingId: reservedBooking._id,
        status: "confirmed",
      };
      user.bookings.push(bookingEntry);
      await user.save();

      // Update the apartment as confirmed
      const apartmentToBook = await Apartment.findByIdAndUpdate(
        reservedBooking.apartmentId,
        {
          $set: {
            bookingStatus: "confirmed",
            confirmedAt: Date.now(),
          },
        }
      );
      apartmentToBook.save();

      res.status(200).json({
        message: "Booking confirmed successfully",
        booking: reservedBooking,
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  InternalBooking: async (req, res) => {
    const { apartmentId } = req.params;
    const {
      startDate,
      endDate,
      comment,
      adult,
      kids,
      firstName,
      lastName,
      gender,
      email,
      phone,
      address,
    } = req.body;

    try {
      // Validate required fields
      if (
        !apartmentId ||
        !startDate ||
        !endDate ||
        !firstName ||
        !lastName ||
        !email ||
        !phone
      ) {
        return res.status(400).json("Missing required fields");
      }

      // Get the apartment details
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) {
        return res.status(404).json("Apartment not found");
      }

      // Check apartment availability
      if (apartment.bookingStatus !== "free") {
        return res
          .status(400)
          .json("This apartment is not available for booking");
      }

      // Calculate total price
      const totalPrice = calculateTotalPrice(
        startDate,
        endDate,
        apartment.price
      );

      // Find or create the user
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          phone,
          gender,
          address,
        });
      }

      // Create the booking
      const booking = await Booking.create({
        guestId: uuidv4(),
        apartmentId,
        startDate,
        endDate,
        totalPrice,
        totalBalance: totalPrice, // total balance to equal total price initially
        totalPayment: 0, //  Total sum paid at this level
        comment,
        adult,
        kids,
        reference: uuidv4().replace(/-/g, "").slice(0, 10), // generate unique reference code
        status: "confirmed",
        userId: user._id,
        paidAt: Date.now(),
        contactInfo: { firstName, lastName, gender, email, phone, address },
      });

      // Update apartment status
      apartment.bookingStatus = "confirmed";
      apartment.confirmedAt = Date.now();
      await apartment.save();

      // Add booking to user's bookings array
      user.bookings.push({ bookingId: booking._id, status: "confirmed" });
      await user.save();

      // Send success response
      res.status(200).json(booking);
    } catch (error) {
      console.error("InternalBooking Error:", error);
      res.status(500).json("Internal server error");
    }
  },

  UpdateBooking: async (req, res) => {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
      const { currentPayment, totalBalance, comment } = req.body;

      const bookingData = await Booking.findById(bookingId);
      // Determine payment status

      const paymentStatus =
        totalBalance && totalBalance > 0 ? "part payment" : "paid";

      const sumOfPayments =
        Number(currentPayment) + Number(bookingData.totalPayment);

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            currentPayment,
            totalBalance,
            comment,
            status: "completed",
            paymentStatus,
            totalPayment: sumOfPayments, // Total sum already paid
          },
        },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Updatae the apartment as occupied
      await Apartment.findByIdAndUpdate(
        updatedBooking.apartmentId.toString(),
        {
          $set: {
            bookingStatus: "occupied",
          },
        },
        { new: true }
      );

      res.status(200).json("updated");
    } catch (error) {
      console.error("UpdateBooking Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  ExtendBooking : async (req, res) => {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
      const { endDate, totalCost } = req.body;

      const bookingData = await Booking.findById(bookingId);
      // Determine payment status

      const sumOfPayments = Number(bookingData.totalPrice) +  Number( totalCost );

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            endDate,
            totalPrice : sumOfPayments,
            totalBalance: totalCost ,
            status: "confirmed",
            paymentStatus: 'pending',
          },
        },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("UpdateBooking Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  BookingPayment: async (req, res) => {
    try {
      const { bookingId } = req.body;

      // Get the booking
      const bookingToBePaidFor = await Booking.findById(bookingId);

      if (!bookingToBePaidFor) {
        return res.status(404).json("This Booking doesn't exist");
      }
      if (bookingToBePaidFor.status !== "confirmed") {
        return res
          .status(404)
          .json("This Booking has not been confirmed or completed");
      }

      // Generate Invoice
      const Invoice = generateInvoice();
      req.body.amount = bookingToBePaidFor.totalPrice;
      req.body.email = bookingToBePaidFor.contactInfo.email;
      form = req.body;
      form.metadata = {
        apartmentId: bookingToBePaidFor.apartmentId,
        Invoice,
        bookingId: bookingToBePaidFor._id,
        userId: bookingToBePaidFor.userId,
      };

      form.amount *= 100;

      await initializePayment(form, (error, body) => {
        if (error) {
          console.log(error);
        }

        returnedResponse = body.data; // set returned response data to a re-usable variable
        res.status(200).json({
          redirect_url: returnedResponse.authorization_url,
          access_code: returnedResponse.access_code,
          reference: returnedResponse.reference,
          success: true,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error");
    }
  },
  paymentCallback: async (req, res) => {
    try {
      const reference = req.query.reference;

      // Check if this payment has been previously verified
      const confirmedBooking = await Booking.findOne({
        reference,
        status: "completed",
      });

      if (confirmedBooking) {
        return res.status(422).json("Payment previously confirmed");
      }

      // Verify Payment Reference
      await verifyPayment(reference, async (error, body) => {
        if (error) {
          console.log(error);
        }

        returnedResponse = body.data;

        const { reference, paid_at , requested_amount} = returnedResponse;
        const { apartmentId, Invoice, bookingId, userId } =
          returnedResponse.metadata;

        // Update Booking in Database
        await Booking.findByIdAndUpdate(
          bookingId,
          {
            $set: {
              paidAt: paid_at,
              reference,
              totalPayment: requested_amount / 100,
              paymentStatus: "paid",
              status: "completed",
              invoice: Invoice,
            },
          },
          { new: true }
        );

        //  Update Apartment in Database

        await Apartment.findByIdAndUpdate(
          apartmentId,
          {
            $set: {
              bookingStatus: "occupied",
            },
          },
          { new: true }
        );

        // Update User bookings in database
        await User.updateOne(
          { _id: userId, "bookings.bookingId": bookingId },
          { $set: { "bookings.$.status": "completed" } }
        );

        // Send Both Dashboard and Email Notifications

        const booking = await Booking.findById(bookingId).populate(
          "apartmentId"
        );

        const user = {
          firstName: booking.contactInfo.firstName,
          lastName: booking.contactInfo.lastName,
          email: booking.contactInfo.email,
        };
        // Send Email
        await BookingSuccessEmail(user, booking);
        await AdminMessageEmail(
          `There has been a successful online booking for <strong> ${
            booking.apartmentId.title
          }</strong> by <br> <strong> ${user.firstName} ${
            user.lastName
          }, </strong> <br> A successful payment of <strong>  ₦${
            booking.totalPrice
          } </strong>  was made via online platform, <br> Check In date is: <strong> ${DateFormatter(
            booking.startDate
          )} <strong>  and check out date is: <strong> ${DateFormatter(
            booking.endDate
          )}, </strong> a total of  <strong> ${
            booking.adult
          } adult(s) </strong> and  <strong> ${booking.kids} kid(s) </strong> `
        );

        res.status(200).json("Payment Successfull");
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({})
        .populate("apartmentId")
        .sort({ createdAt: "desc" });

      res.status(200).json(bookings);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },

  getOneBooking: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id).populate(
        "apartmentId"
      );

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      return res.status(500).json("An error occurred" );
    }
  },
  deleteBooking: async (req, res) => {
    try {
      const { id } = req.params;
  
      // Step 1: Find the booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json("Booking not found");
      }
  
      // Step 2: Find the apartment and update its bookingStatus to 'free'
      const apartment = await Apartment.findById(booking.apartmentId);
      if (!apartment) {
        return res.status(404).json( "Apartment not found");
      }
      apartment.bookingStatus = "free";
      await apartment.save();
  
      // Step 3: Find the user and remove the booking from their bookings array
      const user = await User.findById(booking.userId);
      if (!user) {
        return res.status(404).json( "User not found");
      }
  
      // Filter out the deleted booking from the user's bookings array
      user.bookings = user.bookings.filter(
        (bookingItem) => bookingItem.bookingId.toString() !== id
      );
      await user.save();
  
      // Step 4: Delete the booking
      await Booking.findByIdAndDelete(id);
  
      // Step 5: Return success response
      return res.status(200).json( "Booking deleted successfully");
    } catch (error) {
      console.log(error);
      return res.status(500).json( "An error occurred");
    }
  }
};
