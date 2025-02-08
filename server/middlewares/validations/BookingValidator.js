const {
  validatePhoneNumber,
  validateEmail,
} = require("../../../utils/helpers");

const User = require("../../models/User");
const bcrypt = require('bcryptjs')

module.exports = {
  ValidateBooking: (req, res, next) => {
    try {
      const { startDate, endDate, adult } = req.body;

      if (!startDate || startDate === "") {
        return res.status(422).send("Check In is required");
      }

      if (!endDate || endDate === "") {
        return res.status(422).send("Check Out is required");
      }

         // Parse the dates to ensure they are valid Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Check if the dates are valid
    if (isNaN(start) || isNaN(end)) {
       return res.status(422).send('Invalid Dates')
    }
  
    // Ensure the endDate is after the startDate
    if (end <= start) {
      return res.status(422).send('Check Out Date must be in the future')
    }

      if (!adult || adult === "") {
        return res.status(422).send("Total Adult is required");
      }

      next();
    } catch (error) {
      res.status(422).send(error.message);
    }
  },
  BookingConfirmationValidator: async (req, res, next) => {
      const{ bookingId } = req.params;
    try {
      const { firstName, lastName, email, phone } =
        req.body;

      if (!bookingId || bookingId.trim() === "") {
        return res.status(422).send("Booking Identifier is required");
      }

      if (!firstName || firstName.trim() === "") {
        return res.status(422).send("firstName is required");
      }

      if (!lastName || lastName.trim() === "") {
        return res.status(422).send("lastName is required");
      }

      if (!email || email === "") {
        return res.status(422).send("Your email is required");
      }

      if (!validateEmail(email)) {
        return res.status(422).send("Email is Invalid");
      }

      if (!(phone || validatePhoneNumber(phone))) {
        return res.status(422).send("A Valid phone number is required");
      }

      // Check if the user exists
      const userExists = await User.findOne({ email });
      if (!userExists) {
        const password = process.env.DefaultPassword
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
      }

      next();
    } catch (error) {
      res.status(422).send(error.message);
    }
  },
};
