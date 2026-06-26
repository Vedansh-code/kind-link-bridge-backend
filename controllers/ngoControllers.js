const Ngo = require("../models/Ngo");

// Get all NGOs
exports.getAllNgos = async (req, res) => {
    try {
        const ngos = await Ngo.find().select('-password'); // Exclude password field
        res.json(ngos);
    } catch (error) {
        console.error("Error fetching NGOs:", error);
        res.status(500).json({ error: "Failed to fetch NGOs" });
    }
};

// Get single NGO by ID
exports.getNgoById = async (req, res) => {
    try {
        const ngo = await Ngo.findById(req.params.id).select('-password');
        if (!ngo) {
            return res.status(404).json({ error: "NGO not found" });
        }
        res.json(ngo);
    } catch (error) {
        console.error("Error fetching NGO by ID:", error);
        res.status(500).json({ error: "Failed to fetch NGO details" });
    }
};
