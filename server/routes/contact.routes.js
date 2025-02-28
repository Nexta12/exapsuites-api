const router = require('express').Router();
const contactController = require("../controllers/contactController");
const { ValidateCntactForm } = require('../middlewares/validations/contactValidator');


router.post("/create",ValidateCntactForm, contactController.create )
router.get("/getAll", contactController.getAll )
router.get("/getOne/:id", contactController.getOne )
router.put("/update/:id", contactController.updateStatus )
router.put("/reply/:id", contactController.replyMessage )
router.delete("/delete/:id", contactController.delete )



module.exports = router