const db = require("../config/db");
const { createBooking } = require("../models/bookingModel");

// ================= BOOK SERVICE =================
const bookService = async (req, res) => {
  try {
    const { service_id, user_id } = req.body;

    // ✅ VALIDATE REQUIRED FIELDS
    if (!service_id || !user_id) {
      return res.status(400).json({ message: "Service ID and User ID are required" });
    }

    // 🔥 Get worker_id from service
    const serviceResult = await db.query(
      "SELECT worker_id FROM services WHERE id=$1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const worker_id = serviceResult.rows[0].worker_id;

    // ✅ PREVENT SELF-BOOKING
    if (worker_id === user_id) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    // ✅ CHECK FOR DUPLICATE BOOKING
    const existingBooking = await db.query(
      "SELECT * FROM bookings WHERE service_id=$1 AND user_id=$2 AND status=$3",
      [service_id, user_id, "pending"]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ message: "You have already booked this service" });
    }

    // 🔥 Create booking (status = pending)
    const booking = await createBooking(service_id, user_id, worker_id);

    res.json(booking);

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Error booking service" });
  }
};

// ================= USER BOOKINGS =================
const getUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;

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
    console.error(err);
    res.status(500).json({ message: "Error fetching user bookings" });
  }
};

// ================= WORKER BOOKINGS =================
const getWorkerBookings = async (req, res) => {
  try {
    const { worker_id } = req.params;

    const result = await db.query(
      `SELECT b.*, 
              s.title, s.description, s.price,
              u.name AS user_name,
              u.email AS user_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.user_id = u.id
       WHERE b.worker_id = $1
       ORDER BY b.id DESC`,
      [worker_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching worker bookings" });
  }
};

// ================= UPDATE STATUS =================
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ VALIDATE STATUS
    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    // ✅ CHECK IF BOOKING EXISTS
    const existingBooking = await db.query(
      "SELECT * FROM bookings WHERE id=$1",
      [id]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldStatus = existingBooking.rows[0].status;

    // Only allow status changes if not already accepted/rejected
    if (oldStatus === "accepted" || oldStatus === "rejected") {
      return res.status(400).json({ message: "Booking status cannot be changed once accepted or rejected" });
    }

    const result = await db.query(
      "UPDATE bookings SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *",
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating booking status" });
  }
};

// ================= GET RECENT STATUS CHANGES =================
const getRecentStatusChanges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { since } = req.query; // timestamp in milliseconds

    let query = `
      SELECT b.*, s.title as service_title, u.name as user_name, w.name as worker_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN users w ON b.worker_id = w.id
      WHERE (b.user_id = $1 OR b.worker_id = $1)
      AND b.status IN ('accepted', 'rejected')
    `;

    const params = [userId];

    if (since) {
      // Use COALESCE to handle cases where updated_at might be null
      query += " AND COALESCE(b.updated_at, b.created_at) > $2";
      params.push(new Date(parseInt(since)));
    }

    // Order by updated_at if available, otherwise created_at, then by id as tiebreaker
    query += " ORDER BY COALESCE(b.updated_at, b.created_at) DESC, b.id DESC LIMIT 50";

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("GET RECENT STATUS CHANGES ERROR:", err);
    res.status(500).json({ message: "Error fetching recent status changes" });
  }
};

module.exports = {
  bookService,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
  getRecentStatusChanges,
};