const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public: Anyone can see products
router.get("/", getProducts);

// Protected: Only Logged in Admins can create or delete
router.post("/", protect, admin, createProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
