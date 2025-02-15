const router = require('express').Router();

const authController = require("../controllers/authController");
const { MustBeGuest, emailToLowerCase, checkJwt } = require('../middlewares/authorization');
const { ValidateRegisterForm, ValidateLoginForm } = require('../middlewares/validations/AuthValidatator');


// Register
router.post("/register", MustBeGuest, ValidateRegisterForm, emailToLowerCase, authController.Register )
router.post("/login", MustBeGuest, ValidateLoginForm, emailToLowerCase, authController.Login )
router.post("/logout", authController.Logout);
router.post("/forgot-password", authController.ForgotPassword);
router.post("/verify-otp", authController.VerifyOtp);
router.get("/validate", checkJwt, authController.ValidateAuth);



module.exports = router