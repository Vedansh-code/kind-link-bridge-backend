const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || process.env.SESSION_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        generateTokenAndSetCookie(res, user._id);

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch {
        res.status(500).json({ error: "Signup failed" });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, user._id);

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch {
        res.status(500).json({ error: "Login failed" });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie("jwt", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });

    res.json({ message: "Logged out successfully" });
};
