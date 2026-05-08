const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { createUser, findUserByEmail } = require("../models/userModel");

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = req.body.role || "user";

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(name, email, hashedPassword, role);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check if stored password is a bcrypt hash (starts with $2b$ or $2a$)
    let isMatch;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for legacy plain text passwords
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userId = req.user.id;

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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Profile update failed",
    });
  }
};

module.exports = {
  register,
  login,
  updateUser,
};