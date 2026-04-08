const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// DEBUG (you can keep or remove later)
console.log("Register function:", authController.register);
console.log("Login function:", authController.login);

// REAL ROUTES
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;