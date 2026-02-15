const Order = require("../models/Order");

// 1. GET ALL (GET /api/orders)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. GET SINGLE (GET /api/orders/:id)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. CREATE (POST /api/orders)
const createOrder = async (req, res) => {
  const { customerName, items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items" });
  }

  const order = new Order({
    user: req.user._id, // From Token
    customerName,
    items,
    total
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// 4. UPDATE (PUT /api/orders/:id)
const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after", runValidators: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. DELETE (DELETE /api/orders/:id)
const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.deleteOne();
    res.json({ message: "Order removed" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrder, deleteOrder };