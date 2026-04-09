const express = require('express');
const router = express.Router();

const { bookService } = require('../controllers/bookingController');

router.post('/book', bookService);

module.exports = router;