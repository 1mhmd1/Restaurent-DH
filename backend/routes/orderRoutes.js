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

router.route("/").get(protect, admin, getOrders).post(protect, createOrder);

router
  .route("/:id")
  .get(protect, admin, getOrderById)
  .put(protect, admin, updateOrder)
  .delete(protect, admin, deleteOrder);

module.exports = router;
