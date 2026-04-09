const db = require("../config/db");
const { createBooking } = require("../models/bookingModel");

// ================= BOOK SERVICE =================
const bookService = async (req, res) => {
  try {
    const { service_id, user_id } = req.body;

    // 🔥 Get worker_id from service
    const serviceResult = await db.query(
      "SELECT worker_id FROM services WHERE id=$1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const worker_id = serviceResult.rows[0].worker_id;

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
      `SELECT b.*, s.title, s.description, s.price 
       FROM bookings b
       JOIN services s ON b.service_id = s.id
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
      `SELECT b.*, s.title, s.description, s.price 
       FROM bookings b
       JOIN services s ON b.service_id = s.id
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

    const result = await db.query(
      "UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating booking status" });
  }
};

module.exports = {
  bookService,
  getUserBookings,
  getWorkerBookings,
  updateBookingStatus,
};