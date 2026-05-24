const express = require("express");
const { updateProfile } = require("../controllers/userControllers");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// PUT /api/users/profile - Protected route to update donor profile preferences
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
