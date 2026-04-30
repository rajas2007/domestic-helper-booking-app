const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// ✅ IMPORT FUNCTIONS CORRECTLY
const { register, login, updateUser } = require('../controllers/authController');

// ROUTES
router.post('/register', register);
router.post('/login', login);
router.put('/update', verifyToken, updateUser);

module.exports = router;