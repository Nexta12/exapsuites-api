const router = require("express").Router();
const {
  authenticateUser,
  allowedRoles,
} = require("../middlewares/authorization");

const dashboardStatsController = require("../controllers/statsController");
const { UserRole } = require("../../utils/constants");


router.get("/dashstats",authenticateUser, allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]), dashboardStatsController.dashboardStats);

router.get(
  "/transactions",
  authenticateUser,
  allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]),
  dashboardStatsController.transactionStats
);

router.get(
  "/profile",
  authenticateUser,
  allowedRoles([UserRole.superAdmin, UserRole.admin, UserRole.manager]),
  dashboardStatsController.profilePieChart
);

module.exports = router;
