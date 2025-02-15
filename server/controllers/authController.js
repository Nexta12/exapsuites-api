const {
  AdminMessageEmail,
  ForgotPasswordEmail,
} = require("../../utils/emailCalls");
const { generateAccessToken } = require("../middlewares/authorization");
const User = require("../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { DateFormatter, generateInvoice } = require("../../utils/helpers");
const { createNotification } = require("../../utils/NotifcationCalls");
const bcrypt = require("bcryptjs");
const OTP = require("../models/OtpRecord");

module.exports = {
  Register: async (req, res) => {
    try {
      // Create user

      const { email, password } = req.body;

      const newUser = await User.create({ email, password });

      // Send success response
      AdminMessageEmail(
        `A new guest, with email: ${email} has registered on the Apartments website, Date: ${DateFormatter(
          Date.now()
        )} `
      );
      // Create Dashboard Notification
      await createNotification(
        "New User Registeration",
        `A new guest, with email: ${email} just registered, Date: ${DateFormatter(
          Date.now()
        )} `
      );

      return res.status(201).json(newUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },
  Login: async (req, res, next) => {
    try {
      passport.authenticate("local", { session: true }, (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(404).send(info.message);
        }

        req.logIn(user, async (err) => {
          if (err) {
            return next(err);
          } else {
            // Generate and Send Access Tokens to client:
            const accessToken = generateAccessToken(user, jwt);
            const { password, createdAt, updatedAt, ...payload } = user._doc;

            return res.status(200).json({
              message: "Login successfully",
              accessToken,
              data: payload,
            });
          }
        });
      })(req, res, next);
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  ForgotPassword: async (req, res) => {
    try {
      let { email } = req.body;

      email = email?.trim().toLowerCase();

      // Validate inputs
      if (!email || email === "") {
        return res.status(403).json("Provide your email");
      }

      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(403).json("Email is invalid");
      }

      // Check if email exists
      const userEmailExists = await User.findOne({ email });

      if (!userEmailExists) {
        return res.status(422).json("Invalid Credential");
      }

      // Generate OTP
      const generateOTP = generateInvoice();

      const salt = await bcrypt.genSalt(10);
      const hashedOTP = await bcrypt.hash(generateOTP, salt);

      // Set expiration time to 15 minutes from now
      const expiresIn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the hashed OTP and expiration time in the database
      const storedOtp = await OTP.create({ otp: hashedOTP, email, expiresIn });

      // Send the OTP to the user's email
       await ForgotPasswordEmail(generateOTP, email);

      res.status(201).json(storedOtp);
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },

  VerifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if(!otp || otp === ''){
        return res.status(403).json("Provide the otp sent to you email");
      }

      const otpRecord = await OTP.findOne({ email });

      if (!otpRecord) {
        return res.status(404).json( "OTP not found");
      }

      if (new Date() > otpRecord.expiresIn) {
        return res.status(400).json( "OTP has expired");
      }

      const isValid = await bcrypt.compare(otp, otpRecord.otp);

      if (!isValid) {
        return res.status(400).json( "Invalid OTP");
      }

      otpRecord.isVerified = true;
      otpRecord.save();

      res.status(200).json("OTP verified successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },

  ValidateAuth: async (req, res) => {
    try {
      const currentUser = req.user;

      const userDetails = {
        id: currentUser._id,
        role: currentUser.role,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      };

      res.status(200).json({ data: userDetails });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },
  // Logout function Handler
  Logout: async (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy(); // Clean up the session from Database
      res.status(200).json({ msg: "Logged Out" });
    });
  },
};
