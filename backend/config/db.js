const { Pool } = require("pg");
const logger = require("../utils/logger");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

pool.connect()
  .then(() => logger.info("PostgreSQL connected"))
  .catch(err => logger.error("Connection error", err));

module.exports = pool;