const router = require("express").Router();
const { UserRole } = require("../../utils/constants");
const bookingController = require("../controllers/bookingController");
const {  authenticateUser, allowedRoles } = require("../middlewares/authorization");
const { ValidateBooking, BookingConfirmationValidator } = require("../middlewares/validations/BookingValidator");

router.post("/book/:apartmentId",  ValidateBooking,  bookingController.BookApartment )
router.post("/book/admin/:apartmentId",  authenticateUser, allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]),  ValidateBooking,  bookingController.InternalBooking ) // Internal Booikng
router.put("/confirmation/:bookingId", BookingConfirmationValidator,  bookingController.ConfirmBooking )
router.put("/update/:bookingId", bookingController.UpdateBooking )
router.put("/extend/:bookingId", bookingController.ExtendBooking )
router.post("/bookingPayment", bookingController.BookingPayment )
router.get("/callback", bookingController.paymentCallback )
router.get("/getAll",   allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]), bookingController.getAllBookings  )
router.get("/getAll/:userId",   allowedRoles([ UserRole.guest]), bookingController.getGuestAllBookings  )
router.get("/getOne/:id",  bookingController.getOneBooking  )
router.delete("/delete/:id",  allowedRoles([UserRole.superAdmin]), bookingController.deleteBooking  )
router.delete("/cancellation/:id", bookingController.cancelBooking  )

module.exports = router