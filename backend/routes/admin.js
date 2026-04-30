const express = require('express');
const router = express.Router();
const { getDashboard, getDoctorDashboard } = require('../controllers/adminController');
const { auth, adminOnly, doctorOnly } = require('../middleware/auth');

router.get('/dashboard', auth, adminOnly, getDashboard);
router.get('/doctor-dashboard', auth, doctorOnly, getDoctorDashboard);

module.exports = router;