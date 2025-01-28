const { AdminMessageEmail } = require("../../utils/emailCalls");
const { generateAccessToken } = require("../middlewares/authorization");
const User = require("../models/User")
const passport = require('passport')
const jwt = require("jsonwebtoken");


module.exports = {

   Register: async(req, res) =>{
      try {

        // Create user

        const { email, password } = req.body;

        const newUser = await User.create({email, password});

      // Send success response
      AdminMessageEmail(`A new guest, with email: ${email} has registered on the Apartments website, `)

      return res.status(201).json(newUser);
        
      } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({ message: "An error occurred" });
      }

   },
   Login: async (req, res, next) => {

    try {
      passport.authenticate("local", { session: true }, (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res
            .status(404)
            .send(info.message);
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
      res.status(500).json(err.message );
    }
  },
  ForgotPassword: async (req, res, next) =>{
    try {
      let { email } = req.body;

      email = email?.trim();

      // validate inputs
      if (!email || email == "") {
        throw new Error("Provide your email");
      }

      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        throw new Error("Email is invalid");
      }
      // Check if email exists

      const userEmailExists = await User.findOne({ email });

      if (!userEmailExists) {
        throw new Error("Invalid Credential");
      }

      if (!userEmailExists.verifiedEmail) {
        return res
          .status(422)
          .json({
            message: "Account not Verified",
          });
      }
      // proceed to sending password reset link.
      // sendPasswordResetLink(userEmailExists, req, res);
      console.log('To be continued')
    } catch (error) {
      logger.error(error);
      res.status(422).json({ message: error.message });
    }

  },

  ValidateAuth: async (req, res) => {
    try {

      const currentUser = req.user

      const userDetails = {
        id: currentUser._id,
        role: currentUser.role,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      }
      res
        .status(200).json({data: userDetails})
    } catch (error) {
      res.status(500).send('Internal Server Error')
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
}