console.log("AuthController STARTED");

// ================= IMPORTS =================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { createUser, findUserByEmail } = require("../models/userModel");
const { validateRegister, validateLogin } = require("../utils/validators");

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const { name, email, password } = req.body;
    const role = req.body.role || "user";

    // ✅ VALIDATE INPUT
    const validationErrors = validateRegister({ name, email, password });
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(name, email, hashedPassword, role);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ VALIDATE INPUT
    const validationErrors = validateLogin({ email, password });
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { id, name, email, password } = req.body;

    let query;
    let values;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      query = `
        UPDATE users 
        SET name=$1, email=$2, password=$3 
        WHERE id=$4 
        RETURNING *
      `;

      values = [name, email, hashedPassword, id];
    } else {
      query = `
        UPDATE users 
        SET name=$1, email=$2 
        WHERE id=$3 
        RETURNING *
      `;

      values = [name, email, id];
    }

    const result = await db.query(query, values);

    res.json(result.rows[0]);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      message: "Update failed",
      error: err.message
    });
  }
};

// ================= EXPORT =================
module.exports = {
  register,
  login,
  updateUser,
};