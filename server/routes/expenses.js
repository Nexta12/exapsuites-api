const router = require('express').Router();
const expenseController = require('../controllers/expenseController');
const { authenticateUser } = require('../middlewares/authorization');


router.post("/create", authenticateUser, expenseController.create )
router.get("/getAll", authenticateUser, expenseController.getAll )
router.get("/getOne/:id", authenticateUser, expenseController.getOne )
 router.put("/update/:id", expenseController.update )
 router.delete("/delete/:id", expenseController.delete )


module.exports = router