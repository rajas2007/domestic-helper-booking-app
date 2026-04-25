const db = require("../config/db");
const { getAllServices } = require("../models/serviceModel");

// ================= CREATE SERVICE =================
const addService = async (req, res) => {
  try {
    const { title, description, price, worker_id } = req.body;

    const result = await db.query(
      "INSERT INTO services (title, description, price, worker_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, description, price, worker_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    res.status(500).json({ message: "Error creating service" });
  }
};

// ================= GET ALL SERVICES =================
const fetchServices = async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching services" });
  }
};

// ================= GET WORKER SERVICES =================
const getWorkerServices = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM services WHERE worker_id=$1",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching worker services" });
  }
};

module.exports = {
  addService,
  fetchServices,
  getWorkerServices,
};