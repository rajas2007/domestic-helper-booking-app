const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const {
  addService,
  fetchServices,
  getWorkerServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// routes
router.post("/", verifyToken, verifyRole(['worker']), addService);
router.get("/", verifyToken, fetchServices); // Public services view
router.get("/worker/:id", verifyToken, getWorkerServices);
router.put("/:id", verifyToken, verifyRole(['worker']), updateService);
router.delete("/:id", verifyToken, verifyRole(['worker']), deleteService);

module.exports = router;