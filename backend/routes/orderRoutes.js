const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// Routes that match /api/orders
router.route("/")
  .get(protect, admin, getOrders)      // 1. GET ALL
  .post(protect, createOrder);         // 3. CREATE

// Routes that match /api/orders/:id
router.route("/:id")
  .get(protect, admin, getOrderById)   // 2. GET SINGLE
  .put(protect, admin, updateOrder)    // 4. UPDATE
  .delete(protect, admin, deleteOrder);// 5. DELETE

module.exports = router;