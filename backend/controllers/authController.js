console.log("AuthController STARTED");

// ✅ REQUIRED IMPORTS (you were missing these)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const { createUser, findUserByEmail } = require('../models/userModel');

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const { name, email, password } = req.body;
    const role = req.body.role || "user"; // default role

    console.log("Checking existing user...");
    const existingUser = await findUserByEmail(email);
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user in DB...");
    const user = await createUser(name, email, hashedPassword, role);

    console.log("User created:", user);

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (err) {
    console.error("REGISTER ERROR FULL:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Finding user...");
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id: user.id, email: user.email },
  "mysecretkey",
  { expiresIn: "7d" }
);

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR FULL:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ EXPORT (VERY IMPORTANT)
module.exports = { register, login };