const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTotalRevenue,
  getMonthlyRevenue,
  getMonthlyRevenueBreakdown,
} = require("../controller/transaction");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", createTransaction);
router.get("/all", authMiddleware, getAllTransactions);
router.get("/total-revenue", getTotalRevenue);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/monthly-revenue-breakdown", getMonthlyRevenueBreakdown);


module.exports = router;
