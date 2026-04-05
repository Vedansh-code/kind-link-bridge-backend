require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const session = require("express-session");
const passport = require("passport");

const connectDB = require("./config/db");
require("./config/passport");

const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);


// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
    prompt: "select_account"
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL,
  }),
  (req, res) => {
    req.session.regenerate(function (err) {
      if (err) return res.redirect(process.env.FRONTEND_URL);

      req.session.passport = { user: req.user._id };

      res.redirect(`${process.env.FRONTEND_URL}/#/dashboard`);
    });
  }
);

app.get("/auth/user", (req, res) => {
  res.json(req.user || null);
});

app.get("/auth/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return res.send(err);

    req.session.destroy(function () {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.redirect(process.env.FRONTEND_URL);
    });
  });
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


