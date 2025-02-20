const router = require("express").Router();
const { UserRole } = require("../../utils/constants");
const apartmentController = require("../controllers/apartmentController");
const { authenticateUser, allowedRoles} = require("../middlewares/authorization");
const { cloudinaryUploader } = require("../middlewares/fileUploadManager");
const { ApartmentValidator } = require("../middlewares/validations/ApartmentValidator");




router.post("/create", authenticateUser, allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]), ApartmentValidator, cloudinaryUploader, apartmentController.createApartment )

router.get("/getAll", apartmentController.getAllApartments );

router.get("/getOne/:id", apartmentController.getOneApartment );

router.put("/update/:id", authenticateUser, allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]), cloudinaryUploader, apartmentController.updateApartment )

router.delete("/delete/:id", authenticateUser, allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]), apartmentController.deleteApartment )


module.exports = router