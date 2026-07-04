const Ngo = require("../models/Ngo");
const User = require("../models/User");

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

// Search NGOs
exports.searchNgos = async (req, res) => {
    try {
        const { location, category, name } = req.query;
        const query = {};

        // 1. Filter by location (City or Operating Locations)
        if (location) {
            query.$or = [
                { city: { $regex: new RegExp(location, 'i') } },
                { operatingLocations: { $regex: new RegExp(location, 'i') } }
            ];
        }

        // 2. Filter by category
        if (category) {
            query.category = { $regex: new RegExp(category, 'i') };
        }

        // 3. Optional: Search by NGO name
        if (name) {
            query.name = { $regex: new RegExp(name, 'i') };
        }

        const ngos = await Ngo.find(query).select('-password');
        res.json(ngos);
    } catch (error) {
        console.error("Error searching NGOs:", error);
        res.status(500).json({ error: "Failed to search NGOs" });
    }
};

// Get Rules-Based Recommendations for a User
exports.getRecommendationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // 1. Fetch the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Fetch all NGOs
        const allNgos = await Ngo.find().select('-password');

        // 3. Calculate Match Score for each NGO
        const scoredNgos = allNgos.map(ngo => {
            let score = 0;
            let matchReasons = [];

            // Rule 1: Location Match (+10 points)
            if (
                (ngo.city && ngo.city.toLowerCase() === user.location?.toLowerCase()) ||
                (ngo.operatingLocations && ngo.operatingLocations.some(loc => loc.toLowerCase() === user.location?.toLowerCase()))
            ) {
                score += 10;
                matchReasons.push("Near you");
            }

            // Rule 2: Interest Match (+15 points)
            if (user.fieldsOfInterest && user.fieldsOfInterest.length > 0) {
                const isInterestMatch = user.fieldsOfInterest.some(interest => 
                    ngo.category?.toLowerCase() === interest.toLowerCase()
                );
                
                if (isInterestMatch) {
                    score += 15;
                    matchReasons.push(`Matches your interest in ${ngo.category}`);
                }
            }

            // Rule 3: Verification Trust Boost (+5 points)
            if (ngo.isVerified) {
                score += 5;
            }

            return {
                ...ngo._doc,
                matchScore: score,
                matchReasons: matchReasons
            };
        });

        // 4. Filter out NGOs with a score of 0
        const relevantNgos = scoredNgos.filter(item => item.matchScore > 0);

        // 5. Sort by highest score descending
        relevantNgos.sort((a, b) => b.matchScore - a.matchScore);

        // 6. Return top 10 recommendations
        res.json(relevantNgos.slice(0, 10));

    } catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
};
