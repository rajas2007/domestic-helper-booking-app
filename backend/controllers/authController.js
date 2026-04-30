// ================= IMPORTS =================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { createUser, findUserByEmail } = require("../models/userModel");
const { validateRegister, validateLogin } = require("../utils/validators");
const sanitizeInput = require('../utils/sanitization');
const logger = require('../utils/logger');

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = req.body.role || "user";

    // ✅ SANITIZE INPUTS
    const sanitizedData = {
      name: sanitizeInput.textWithLimit(name, 255),
      email: sanitizeInput.email(email),
      password,
      role
    };

    // ✅ VALIDATE INPUT
    const validationErrors = validateRegister(sanitizedData);
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const existingUser = await findUserByEmail(sanitizedData.email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);

    const user = await createUser(sanitizedData.name, sanitizedData.email, hashedPassword, role);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    logger.error("REGISTER ERROR:", err);
    // ✅ SECURE ERROR RESPONSE - No sensitive information
    res.status(500).json({ message: "Registration failed" });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ SANITIZE INPUTS
    const sanitizedData = {
      email: sanitizeInput.email(email),
      password
    };

    // ✅ VALIDATE INPUT
    const validationErrors = validateLogin(sanitizedData);
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const user = await findUserByEmail(sanitizedData.email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }  // Reduced from 7 days to 1 hour
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    logger.error("LOGIN ERROR:", err);
    // ✅ SECURE ERROR RESPONSE - No sensitive information
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id; // ✅ Get from verified token, not request body

    // Validate email isn't already taken by someone else
    if (email) {
      const existing = await db.query(
        'SELECT id FROM users WHERE email=$1 AND id!=$2',
        [email, userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    let query;
    let values;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      query = `
        UPDATE users
        SET name=$1, email=$2, password=$3
        WHERE id=$4
        RETURNING id, name, email, role
      `;

      values = [name, email, hashedPassword, userId];
    } else {
      query = `
        UPDATE users
        SET name=$1, email=$2
        WHERE id=$3
        RETURNING id, name, email, role
      `;

      values = [name, email, userId];
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    logger.error("UPDATE ERROR:", err);
    // ✅ SECURE ERROR RESPONSE - No sensitive information
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ================= EXPORT =================
module.exports = {
  register,
  login,
  updateUser,
};