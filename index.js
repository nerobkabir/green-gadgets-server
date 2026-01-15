require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (SECURE - ENV)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const itemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    co2: String
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

// Helper function (_id → id)
const transformItem = (item) => {
  const obj = item.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined
  };
};

// Routes

// Get all items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items.map(transformItem));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get single item
app.get("/items/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(transformItem(item));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add new item
app.post("/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(transformItem(item));
  } catch (err) {
    res.status(400).json({ message: "Failed to add item", error: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
