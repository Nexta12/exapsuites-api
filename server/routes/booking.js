const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { mustBeSuperAdminOrAdmin } = require("../middlewares/authorization");
const { ValidateBooking, BookingConfirmationValidator } = require("../middlewares/validations/BookingValidator");

router.post("/book/:apartmentId", ValidateBooking,  bookingController.BookApartment )
router.put("/confirmation/:bookingId", BookingConfirmationValidator,  bookingController.ConfirmBooking )
router.put("/updateBooking", bookingController.UpdateBooking )
router.post("/bookingPayment", bookingController.BookingPayment )
router.get("/callback", bookingController.paymentCallback )
router.get("/getAll",  mustBeSuperAdminOrAdmin, bookingController.getAllBookings  )
router.get("/getOne/:id",  bookingController.getOneBooking  )

module.exports = router