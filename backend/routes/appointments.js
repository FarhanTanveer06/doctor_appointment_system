const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, confirmAppointment, cancelAppointment } = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

router.post('/', auth, bookAppointment);
router.get('/', auth, getMyAppointments);
router.put('/:id/confirm', auth, confirmAppointment);
router.put('/:id/cancel', auth, cancelAppointment);

module.exports = router;