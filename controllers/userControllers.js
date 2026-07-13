const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        const { fieldsOfInterest, donationType, location } = req.body;

        // Perform findByIdAndUpdate to update fields cleanly without overwriting credentials
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    fieldsOfInterest,
                    donationType,
                    location
                }
            },
            {
                new: true, // returns the updated document
                runValidators: true // runs Mongoose schema validators on update
            }
        ).select("-password"); // Excludes the secure hashed password from response

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("❌ Profile update error:", error.message);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

const { Favorite } = require("../models/ChatbotAction");

exports.getUserFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(favorites);
    } catch (error) {
        console.error("❌ Fetch favorites error:", error.message);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
};
