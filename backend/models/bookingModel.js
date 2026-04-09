const pool = require('../config/db');

const createBooking = async (service_id, user_id) => {
  const result = await pool.query(
    "INSERT INTO bookings (service_id, user_id) VALUES ($1, $2) RETURNING *",
    [service_id, user_id]
  );

  return result.rows[0];
};

module.exports = { createBooking };