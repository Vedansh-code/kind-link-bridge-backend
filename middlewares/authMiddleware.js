const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET);
        
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ error: "Unauthorized - User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};

module.exports = authMiddleware;
