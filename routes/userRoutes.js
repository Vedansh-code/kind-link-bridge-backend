const express = require("express");
const { updateProfile, getUserFavorites } = require("../controllers/userControllers");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// PUT /api/users/profile - Protected route to update donor profile preferences
router.put("/profile", authMiddleware, updateProfile);

// GET /api/users/:userId/favorites - Fetch user's favorite NGOs
router.get("/:userId/favorites", getUserFavorites);

module.exports = router;
