const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, addDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllDoctors);
router.post('/', auth, adminOnly, upload.single('image'), addDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', auth, adminOnly, upload.single('image'), updateDoctor);
router.delete('/:id', auth, adminOnly, deleteDoctor);

module.exports = router;