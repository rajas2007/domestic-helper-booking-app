const express = require('express');
const router = express.Router();

// ✅ IMPORT FUNCTIONS CORRECTLY
const { register, login, updateUser } = require('../controllers/authController');

// DEBUG (optional)
console.log("Register function:", register);
console.log("Login function:", login);
console.log("Update function:", updateUser);

// ROUTES
router.post('/register', register);
router.post('/login', login);
router.put('/update', updateUser);

module.exports = router;