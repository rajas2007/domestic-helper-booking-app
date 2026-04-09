const db = require("../config/db");

const createBooking = async (service_id, user_id, worker_id) => {
  const result = await db.query(
    "INSERT INTO bookings (service_id, user_id, worker_id, status) VALUES ($1,$2,$3,$4) RETURNING *",
    [service_id, user_id, worker_id, "pending"]
  );

  return result.rows[0];
};

module.exports = { createBooking };