const pool = require('../config/db');

const createService = async (title, description, price, user_id) => {
  const result = await pool.query(
    "INSERT INTO services (title, description, price, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, description, price, user_id]
  );

  return result.rows[0];
};

const getAllServices = async () => {
  const result = await pool.query("SELECT * FROM services");
  return result.rows;
};

module.exports = { createService, getAllServices };