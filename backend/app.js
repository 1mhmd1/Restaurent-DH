const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/menu-items", menuRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
