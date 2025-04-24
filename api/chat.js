const bcrypt = require("bcrypt");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Database } = require("@replit/database");

const db = new Database();

// Serverless function main entry point
module.exports = async (req, res) => {
  const method = req.method;
  const path = req.url;

  // Handle Login POST request
  if (method === "POST" && path === "/login") {
    const { username, password } = req.body;

    // Check if username exists and password matches
    const storedPassword = await db.get(username);
    if (!storedPassword || !(await bcrypt.compare(password, storedPassword))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a session cookie or any other method to persist user info (like JWT)
    res.status(200).json({ message: "Login successful", user: username });
    return;
  }

  // Handle Signup POST request
  if (method === "POST" && path === "/signup") {
    const { username, password } = req.body;

    const existing = await db.get(username);
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.set(username, hashedPassword);

    res.status(200).json({ message: "Signup successful" });
    return;
  }

  // If the method/path does not match, return 404
  res.status(404).send("Not Found");
};
