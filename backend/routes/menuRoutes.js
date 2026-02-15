const express = require("express");
const router = express.Router();
const {
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

router.post("/", protect, admin, addMenuItem);
router.put("/:id", protect, admin, updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);

module.exports = router;
