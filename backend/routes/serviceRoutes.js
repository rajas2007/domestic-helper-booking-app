const express = require("express");
const router = express.Router();

const {
  addService,
  fetchServices,
  getWorkerServices,
} = require("../controllers/serviceController");

// routes
router.post("/", addService);
router.get("/", fetchServices);
router.get("/worker/:id", getWorkerServices); 

module.exports = router;