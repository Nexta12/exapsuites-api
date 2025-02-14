const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const { mustBeSuperAdminOrAdmin, authenticateUser, mustBeSuperAdmin } = require("../middlewares/authorization");
const { ValidateBooking, BookingConfirmationValidator } = require("../middlewares/validations/BookingValidator");

router.post("/book/:apartmentId",  ValidateBooking,  bookingController.BookApartment )
router.post("/book/admin/:apartmentId",  authenticateUser, mustBeSuperAdminOrAdmin,  ValidateBooking,  bookingController.InternalBooking ) // Internal Booikng
router.put("/confirmation/:bookingId", BookingConfirmationValidator,  bookingController.ConfirmBooking )
router.put("/update/:bookingId", bookingController.UpdateBooking )
router.put("/extend/:bookingId", bookingController.ExtendBooking )
router.post("/bookingPayment", bookingController.BookingPayment )
router.get("/callback", bookingController.paymentCallback )
router.get("/getAll",  mustBeSuperAdminOrAdmin, bookingController.getAllBookings  )
router.get("/getOne/:id",  bookingController.getOneBooking  )
router.delete("/delete/:id", mustBeSuperAdmin, bookingController.deleteBooking  )
router.delete("/cancellation/:id", bookingController.cancelBooking  )

module.exports = router