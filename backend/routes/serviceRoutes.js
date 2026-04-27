const express = require("express");
const router = express.Router();

const {
  addService,
  fetchServices,
  getWorkerServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// routes
router.post("/", addService);
router.get("/", fetchServices);
router.get("/worker/:id", getWorkerServices); 
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;