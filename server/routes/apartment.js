const router = require("express").Router();
const apartmentController = require("../controllers/apartmentController");
const { authenticateUser, mustBeSuperAdminOrAdmin } = require("../middlewares/authorization");
const { cloudinaryUploader } = require("../middlewares/fileUploadManager");
const { ApartmentValidator } = require("../middlewares/validations/ApartmentValidator");




router.post("/create", authenticateUser, mustBeSuperAdminOrAdmin, ApartmentValidator, cloudinaryUploader, apartmentController.createApartment )

router.get("/getAll", apartmentController.getAllApartments );

router.get("/getOne/:id", apartmentController.getOneApartment );

router.put("/update/:id", authenticateUser, mustBeSuperAdminOrAdmin, cloudinaryUploader, apartmentController.updateApartment )

router.delete("/delete/:id", authenticateUser, mustBeSuperAdminOrAdmin, apartmentController.deleteApartment )


module.exports = router