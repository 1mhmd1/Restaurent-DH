import { useState, useEffect } from "react";
import "./App.css";

// 1. BACKEND CONNECTION
// Ensure your backend is running on port 5000 and has the /api prefix mounted
const API_BASE = "http://localhost:5000/api";

// Helper to manage JWT Token headers for protected routes
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 2. API SERVICE
const api = {
  login: (email, password) =>
    fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Invalid credentials"),
    ),

  register: (name, email, password) =>
    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "admin" }),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Registration failed"),
    ),

  getMenuItems: () => fetch(`${API_BASE}/menu-items`).then((res) => res.json()),

  createMenuItem: (data) =>
    fetch(`${API_BASE}/menu-items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to create item"),
    ),

  updateMenuItem: (id, data) =>
    fetch(`${API_BASE}/menu-items/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to update item"),
    ),

  deleteMenuItem: (id) =>
    fetch(`${API_BASE}/menu-items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to delete item"),
    ),

  getOrders: () =>
    fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() }).then((res) =>
      res.json(),
    ),

  updateOrder: (id, data) =>
    fetch(`${API_BASE}/orders/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to update order"),
    ),

  deleteOrder: (id) =>
    fetch(`${API_BASE}/orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((res) =>
      res.ok ? res.json() : Promise.reject("Failed to delete order"),
    ),
};

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
  });
  const [orderFormData, setOrderFormData] = useState({ status: "" });

  const categories = [
    "Pizza",
    "Burgers",
    "Salads",
    "Seafood",
    "Desserts",
    "Drinks",
    "Appetizers",
  ];
  const orderStatuses = ["pending", "preparing", "completed", "cancelled"];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        fetchInitialData();
      } catch (e) {
        console.error("Session restore failed:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const fetchInitialData = () => {
    fetchMenuItems();
    fetchOrders();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isRegistering
        ? await api.register(authForm.name, authForm.email, authForm.password)
        : await api.login(authForm.email, authForm.password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      fetchInitialData();
    } catch (err) {
      console.error("Authentication Error:", err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const fetchMenuItems = async () => {
    try {
      const data = await api.getMenuItems();
      setFoods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menu fetch failed:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Order fetch failed:", err);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price) };
    setLoading(true);
    try {
      if (editingFood) {
        const updated = await api.updateMenuItem(editingFood._id, payload);
        setFoods(foods.map((f) => (f._id === editingFood._id ? updated : f)));
      } else {
        const created = await api.createMenuItem(payload);
        setFoods([...foods, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submit Error:", err);
      alert(
        "Error: Ensure your backend is running and your account is an Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm("Delete this dish?")) {
      try {
        await api.deleteMenuItem(id);
        setFoods(foods.filter((f) => f._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Delete failed.");
      }
    }
  };

  const handleOrderUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateOrder(editingOrder._id, {
        status: orderFormData.status,
      });
      setOrders(orders.map((o) => (o._id === editingOrder._id ? updated : o)));
      setIsOrderModalOpen(false);
    } catch (err) {
      console.error("Order update failed:", err);
      alert("Update failed.");
    }
  };

  const handleOrderDelete = async (id) => {
    if (window.confirm("Delete this order record?")) {
      try {
        await api.deleteOrder(id);
        setOrders(orders.filter((o) => o._id !== id));
      } catch (err) {
        console.error("Order delete failed:", err);
        alert("Delete failed.");
      }
    }
  };

  // SAFETY FILTERS: Optional Chaining (?.) prevents crashes if data is missing or corrupted
  const filteredFoods = foods.filter((f) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredOrders = orders.filter((o) =>
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h2>{isRegistering ? "Create Admin Account" : "Admin Login"}</h2>
          <form onSubmit={handleAuth}>
            {isRegistering && (
              <input
                type="text"
                placeholder="Name"
                value={authForm.name}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : isRegistering ? "Sign Up" : "Login"}
            </button>
          </form>
          <p
            style={{ cursor: "pointer", color: "#2563eb", marginTop: "10px" }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Already have an account? Login here"
              : "Don't have an account? Register here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🍽️ Restaurant</h2>
          <span>Admin: {user.name}</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            📋 Menu Items
          </button>
          <button
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Orders
          </button>
          <button onClick={handleLogout} className="nav-item logout-btn">
            🚪 Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === "menu" ? "Menu Management" : "Orders Management"}
          </h1>
          {activeTab === "menu" && (
            <button
              className="btn-primary"
              onClick={() => {
                setEditingFood(null);
                setFormData({
                  name: "",
                  category: "",
                  price: "",
                  description: "",
                  image: "",
                });
                setIsModalOpen(true);
              }}
            >
              + Add New Item
            </button>
          )}
        </header>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>

        {activeTab === "menu" ? (
          <div className="food-grid">
            {filteredFoods.map((food) => (
              <div key={food._id} className="food-card">
                <div className="food-image">
                  <img
                    src={food.image || "https://via.placeholder.com/150"}
                    alt={food.name}
                  />
                </div>
                <div className="food-details">
                  <h3>{food.name}</h3>
                  <p className="food-category">{food.category}</p>
                  <p className="food-price">
                    ${Number(food.price || 0).toFixed(2)}
                  </p>
                </div>
                <div className="food-actions">
                  <button
                    onClick={() => {
                      setEditingFood(food);
                      setFormData({
                        ...food,
                        price: (food.price || 0).toString(),
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(food._id)}
                    className="btn-delete-small"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id?.slice(-6).toUpperCase()}</td>
                    <td>{order.customerName}</td>
                    <td>
                      {order.items?.map((item) => item.name).join(", ") ||
                        "No items"}
                    </td>
                    <td>${Number(order.total || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setOrderFormData({ status: order.status });
                          setIsOrderModalOpen(true);
                        }}
                      >
                        ✏️ Status
                      </button>
                      <button
                        onClick={() => handleOrderDelete(order._id)}
                        className="btn-delete-small"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingFood ? "Edit Item" : "Add Item"}</h2>
            <form onSubmit={handleMenuSubmit}>
              <input
                type="text"
                placeholder="Dish Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
              <div className="modal-btns">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsOrderModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Update Order Status</h2>
            <form onSubmit={handleOrderUpdate}>
              <select
                value={orderFormData.status}
                onChange={(e) => setOrderFormData({ status: e.target.value })}
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="modal-btns">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
