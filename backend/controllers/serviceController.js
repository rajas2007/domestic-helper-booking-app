const db = require("../config/db");
const { getAllServices } = require("../models/serviceModel");
const { validateService } = require("../utils/validators");

// ================= CREATE SERVICE =================
const addService = async (req, res) => {
  try {
    const { title, description, price, worker_id } = req.body;

    // ✅ VALIDATE INPUT
    const validationErrors = validateService({ title, description, price, worker_id });
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const result = await db.query(
      "INSERT INTO services (title, description, price, worker_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [title.trim(), description.trim(), Number(price), worker_id]
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
      "SELECT * FROM services WHERE worker_id=$1 ORDER BY id DESC",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching worker services" });
  }
};

// ================= UPDATE SERVICE =================
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    // Check if service exists
    const existing = await db.query("SELECT * FROM services WHERE id=$1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Validate (pass existing worker_id since it's not being updated)
    const validationErrors = validateService({ title, description, price, worker_id: existing.rows[0].worker_id });
    if (validationErrors) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const result = await db.query(
      "UPDATE services SET title=$1, description=$2, price=$3 WHERE id=$4 RETURNING *",
      [title.trim(), description.trim(), Number(price), id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    res.status(500).json({ message: "Error updating service" });
  }
};

// ================= DELETE SERVICE =================
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existing = await db.query("SELECT * FROM services WHERE id=$1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete related bookings first
    await db.query("DELETE FROM bookings WHERE service_id=$1", [id]);

    // Delete service
    await db.query("DELETE FROM services WHERE id=$1", [id]);

    res.json({ message: "Service deleted successfully" });

  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    res.status(500).json({ message: "Error deleting service" });
  }
};

module.exports = {
  addService,
  fetchServices,
  getWorkerServices,
  updateService,
  deleteService,
};