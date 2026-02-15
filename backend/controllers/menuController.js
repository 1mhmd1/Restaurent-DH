const MenuItem = require("../models/MenuItem");

//    POST /api/menu-items
exports.addMenuItem = async (req, res) => {
  try {
    const newItem = await MenuItem.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//   GET /api/menu-items
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//    GET /api/menu-items/:id
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Dish not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Invalid ID format or Server Error" });
  }
};

//    PUT /api/menu-items/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: "Update failed: " + err.message });
  }
};

//  DELETE /api/menu-items/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item successfully removed from menu" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed: " + err.message });
  }
};
