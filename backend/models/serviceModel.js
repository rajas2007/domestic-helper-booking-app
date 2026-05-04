const db = require('../config/db');

const createService = async (title, description, price, user_id) => {
  const result = await db.query(
    "INSERT INTO services (title, description, price, worker_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, description, price, user_id]
  );

  return result.rows[0];
};

const getAllServices = async () => {
  const result = await db.query(
    `SELECT s.*, u.name AS worker_name
     FROM services s
     LEFT JOIN users u ON s.worker_id = u.id
     ORDER BY s.id DESC`
  );
  return result.rows;
};

module.exports = { createService, getAllServices };