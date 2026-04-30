const db = require("../config/db");
const { createBooking } = require("../models/bookingModel");
const sanitizeInput = require('../utils/sanitization');
const logger = require('../utils/logger');

// ================= BOOK SERVICE =================
const bookService = async (req, res) => {
  try {
    const { service_id, user_id } = req.body;
    const authenticatedUserId = req.user.id;

    // ✅ SANITIZE INPUTS
    const sanitizedData = {
      service_id: sanitizeInput.number(service_id),
      user_id: sanitizeInput.number(user_id)
    };

    // ✅ VERIFY OWNERSHIP - Users can only book for themselves
    if (sanitizedData.user_id !== authenticatedUserId) {
      return res.status(403).json({ message: "You can only book services for yourself" });
    }

    // ✅ VALIDATE REQUIRED FIELDS
    if (!sanitizedData.service_id || !sanitizedData.user_id) {
      return res.status(400).json({ message: "Service ID and User ID are required" });
    }

    // 🔥 Get worker_id from service
    const serviceResult = await db.query(
      "SELECT worker_id FROM services WHERE id=$1",
      [sanitizedData.service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const worker_id = serviceResult.rows[0].worker_id;

    // ✅ PREVENT SELF-BOOKING
    if (worker_id === authenticatedUserId) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    // ✅ CHECK FOR DUPLICATE BOOKING
    const existingBooking = await db.query(
      "SELECT * FROM bookings WHERE service_id=$1 AND user_id=$2 AND status=$3",
      [sanitizedData.service_id, authenticatedUserId, "pending"]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ message: "You have already booked this service" });
    }

    // 🔥 Create booking (status = pending)
    const booking = await createBooking(sanitizedData.service_id, authenticatedUserId, worker_id);

    res.json(booking);

  } catch (err) {
    logger.error("BOOKING ERROR:", err);
    // ✅ SECURE ERROR RESPONSE - No sensitive information
    res.status(500).json({ message: "Booking failed" });
  }
};

// ================= USER BOOKINGS =================
const getUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const authenticatedUserId = req.user.id;

    // ✅ VERIFY OWNERSHIP - Users can only see their own bookings
    if (parseInt(user_id) !== authenticatedUserId) {
      return res.status(403).json({ message: "You can only view your own bookings" });
    }

    const result = await db.query(
      `SELECT b.*,
              s.title, s.description, s.price,
              w.name AS worker_name,
              w.email AS worker_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users w ON b.worker_id = w.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: "Error fetching user bookings" });
  }
};

// ================= WORKER BOOKINGS =================
const getWorkerBookings = async (req, res) => {
  try {
    const { worker_id } = req.params;
    const authenticatedUserId = req.user.id;

    // ✅ VERIFY OWNERSHIP - Workers can only see their own bookings
    if (parseInt(worker_id) !== authenticatedUserId) {
      return res.status(403).json({ message: "You can only view bookings for your own services" });
    }

    const result = await db.query(
      `SELECT b.*,
              s.title, s.description, s.price,
              u.name AS user_name,
              u.email AS user_email
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.worker_id = $1
       ORDER BY b.id DESC`,
      [worker_id]
    );

    res.json(result.rows);
  } catch (err) {
    logger.error("WORKER BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Error fetching worker bookings" });
  }
};

// ================= UPDATE STATUS =================
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ SANITIZE INPUTS
    const sanitizedData = {
      id: sanitizeInput.number(id),
      status: sanitizeInput.textWithLimit(status, 20),
    };

    // ✅ VALIDATE INPUT
    if (!sanitizedData.id || isNaN(sanitizedData.id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // ✅ VALIDATE STATUS
    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(sanitizedData.status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    // ✅ CHECK IF BOOKING EXISTS
    const existingBooking = await db.query(
      "SELECT * FROM bookings WHERE id=$1",
      [sanitizedData.id]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = existingBooking.rows[0];
    const oldStatus = booking.status;

    // ✅ VERIFY USER OWNERSHIP - Only worker can update booking status
    if (booking.worker_id !== req.user.id) {
      return res.status(403).json({ message: "You can only update bookings for your own services" });
    }

    // Only allow status changes if not already accepted/rejected
    if (oldStatus === "accepted" || oldStatus === "rejected") {
      return res.status(400).json({ message: "Booking status cannot be changed once accepted or rejected" });
    }

    // Try to update with updated_at first, fallback without it
    let result;
    try {
      result = await db.query(
        "UPDATE bookings SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *",
        [sanitizedData.status, sanitizedData.id]
      );
    } catch (updateError) {
      result = await db.query(
        "UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *",
        [sanitizedData.status, sanitizedData.id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    // ✅ SECURE ERROR RESPONSE - No sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({ message: "Failed to update booking status" });
    } else {
      res.status(500).json({
        message: "Error updating booking status",
        error: err.message,
      });
    }
  }
};

// ================= GET RECENT STATUS CHANGES =================
const getRecentStatusChanges = async (req, res) => {
  try {
    const { userId } = req.params;

    // Defensive query with error handling
    const query = `
      SELECT
        b.*,
        s.title as service_title,
        u.name as user_name,
        w.name as worker_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN users w ON b.worker_id = w.id
      WHERE (b.user_id = $1 OR b.worker_id = $1)
      AND b.status IN ('accepted', 'rejected')
      ORDER BY b.id DESC LIMIT 50
    `;

    const result = await db.query(query, [parseInt(userId) || 0]);
    res.json(result.rows || []);
  } catch (err) {
    logger.error("GET RECENT STATUS CHANGES ERROR:", err);
    // Return empty array instead of 500 error to prevent app crashes
    res.json([]);
  }
};

module.exports = {
  bookService,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
  getRecentStatusChanges,
};