require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();
const server = http.createServer(app);


// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1);

app.use(passport.initialize());

// Uptime Bot

app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("Server running");
});

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://${LOCAL_IP}:${PORT}`);
});

// MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL,
    session: false
  }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || process.env.SESSION_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL}/#/dashboard`);
  }
);

app.get("/auth/user", authMiddleware, (req, res) => {
  res.json(req.user);
});

app.get("/auth/logout", (req, res) => {
  res.clearCookie("jwt", {
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.redirect(process.env.FRONTEND_URL);
});


// Socket.io
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("🔴 Client disconnected:", socket.id)
  );
});

// Utility
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "localhost";
}

const LOCAL_IP = getLocalIP();
