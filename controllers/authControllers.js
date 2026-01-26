const bcrypt = require("bcrypt");
const User = require("../models/User");

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
    req.logout(err => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }

        // Destroy session
        req.session.destroy(() => {
            // Clear session cookie
            res.clearCookie("connect.sid", {
                path: "/",
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production",
            });

            res.json({ message: "Logged out successfully" });
        });
    });
};
