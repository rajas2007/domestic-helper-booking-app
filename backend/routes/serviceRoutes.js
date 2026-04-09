const express = require('express');
const router = express.Router();

const { addService, fetchServices } = require('../controllers/serviceController');

router.post('/add', addService);
router.get('/all', fetchServices);

module.exports = router;