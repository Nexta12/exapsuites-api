const router = require('express').Router();
const notificationController = require("../controllers/notificationController");


router.get("/all", notificationController.getAll )
router.put("/update/:id", notificationController.updateStatus )
router.delete("/delete/:id", notificationController.delete )



module.exports = router