const express = require('express');
const router = express.Router();

const {
  bookService,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

// ================= CREATE BOOKING =================
router.post('/book', bookService);

// ================= USER BOOKINGS =================
router.get('/user/:user_id', getUserBookings);

// ================= WORKER BOOKINGS =================
router.get('/worker/:worker_id', getWorkerBookings);

// ================= UPDATE STATUS =================
router.put('/:id', updateBookingStatus);

module.exports = router;