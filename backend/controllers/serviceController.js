const { createService, getAllServices } = require('../models/serviceModel');

const addService = async (req, res) => {
  try {
    const { title, description, price, user_id } = req.body;

    const service = await createService(title, description, price, user_id);

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating service" });
  }
};

const fetchServices = async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services" });
  }
};

module.exports = { addService, fetchServices };