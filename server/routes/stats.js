const router = require('express').Router();
 const { authenticateUser, mustBeSuperAdminOrAdmin } = require('../middlewares/authorization');

const dashboardStatsController = require('../controllers/statsController')

router.get('/dashstats', authenticateUser, mustBeSuperAdminOrAdmin, dashboardStatsController.dashboardStats);

router.get('/transactions', authenticateUser, mustBeSuperAdminOrAdmin, dashboardStatsController.transactionStats)

router.get('/profile', 
    // authenticateUser, mustBeSuperAdminOrAdmin,
     dashboardStatsController.profilePieChart)




module.exports = router