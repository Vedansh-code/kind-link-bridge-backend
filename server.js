const express = require("express");
const Database = require("better-sqlite3");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite database setup
const db = new Database("./users.db", { verbose: console.log });

// Create tables if they don’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS volunteer_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    hours INTEGER,
    date TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS user_causes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    cause_name TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Signup API
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  try {
    const stmt = db.prepare(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`);
    const info = stmt.run(username, email, password);
    res.json({ id: info.lastInsertRowid, username, email });
  } catch (err) {
    res.status(400).json({ error: "⚠️ Email already exists" });
  }
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare(`SELECT * FROM users WHERE email = ? AND password = ?`).get(email, password);
    if (!user) return res.status(400).json({ error: "❌ Invalid credentials" });
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "⚠️ Internal server error" });
  }
});

// Donation API
app.post("/donations", (req, res) => {
  const { user_id, amount } = req.body;
  const date = new Date().toISOString();
  try {
    const stmt = db.prepare(`INSERT INTO donations (user_id, amount, date) VALUES (?, ?, ?)`);
    const info = stmt.run(user_id, amount, date);

    io.emit(`donation-update-${user_id}`, { amount });

    res.json({ id: info.lastInsertRowid, user_id, amount, date });
  } catch (err) {
    res.status(500).json({ error: "Failed to add donation" });
  }
});

// Volunteer Hours API
app.post("/volunteer", (req, res) => {
  const { user_id, hours } = req.body;
  const date = new Date().toISOString();
  try {
    const stmt = db.prepare(`INSERT INTO volunteer_hours (user_id, hours, date) VALUES (?, ?, ?)`);
    const info = stmt.run(user_id, hours, date);
    res.json({ id: info.lastInsertRowid, user_id, hours, date });
  } catch (err) {
    res.status(500).json({ error: "Failed to log hours" });
  }
});

// Cause Support API
app.post("/causes", (req, res) => {
  const { user_id, cause_name } = req.body;
  try {
    const stmt = db.prepare(`INSERT INTO user_causes (user_id, cause_name) VALUES (?, ?)`);
    const info = stmt.run(user_id, cause_name);
    res.json({ id: info.lastInsertRowid, user_id, cause_name });
  } catch (err) {
    res.status(500).json({ error: "Failed to support cause" });
  }
});

// Dashboard API
app.get("/dashboard/:user_id", (req, res) => {
  const { user_id } = req.params;
  try {
    const user = db.prepare(`SELECT username, email FROM users WHERE id = ?`).get(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const donation = db.prepare(`SELECT SUM(amount) as total_donations FROM donations WHERE user_id = ?`).get(user_id);
    const hours = db.prepare(`SELECT SUM(hours) as total_hours FROM volunteer_hours WHERE user_id = ?`).get(user_id);
    const causes = db.prepare(`SELECT cause_name FROM user_causes WHERE user_id = ?`).all(user_id);

    res.json({
      user,
      total_donations: donation?.total_donations || 0,
      total_hours: hours?.total_hours || 0,
      causes: causes.map(c => c.cause_name),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Client disconnected:", socket.id));
});

// Get local IP
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

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://${LOCAL_IP}:${PORT}`);
  console.log(`✅ Mobile devices can access using http://${LOCAL_IP}:${PORT}`);
});
