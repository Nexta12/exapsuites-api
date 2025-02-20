const router = require("express").Router();
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authorization");
const { cloudinaryUploader } = require("../middlewares/fileUploadManager");
const { ValidateUpdateUserForm, ValidateRegisterForm } = require("../middlewares/validations/AuthValidatator");

router.post("/create",  authenticateUser, ValidateUpdateUserForm, ValidateRegisterForm, cloudinaryUploader, userController.createUser); // Added Vailidate Update Form Cos of email

router.get("/test", userController.createSuperAdmin); 
router.get("/getAll", authenticateUser, userController.getAllUsers); 
router.get("/getOne/:id", authenticateUser, userController.getOne); 
router.put("/update/:id",  authenticateUser, ValidateUpdateUserForm, cloudinaryUploader, userController.updateUser);
router.put("/update-password/:id",  authenticateUser, userController.updateUserPassword);
router.delete("/delete/:id",  authenticateUser, userController.deleteUser);



module.exports = router;