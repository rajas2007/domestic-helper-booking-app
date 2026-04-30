const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const {
  bookService,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
  getRecentStatusChanges,
} = require('../controllers/bookingController');

// ================= CREATE BOOKING =================
router.post('/book', verifyToken, verifyRole(['user']), bookService);

// ================= USER BOOKINGS =================
router.get('/user/:user_id', verifyToken, getUserBookings);

// ================= WORKER BOOKINGS =================
router.get('/worker/:worker_id', verifyToken, getWorkerBookings);

// ================= UPDATE STATUS =================
router.put('/:id', verifyToken, verifyRole(['worker']), updateBookingStatus);

// ================= RECENT STATUS CHANGES =================
router.get('/status-changes/:userId', verifyToken, getRecentStatusChanges);

module.exports = router;