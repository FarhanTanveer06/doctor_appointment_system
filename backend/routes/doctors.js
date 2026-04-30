const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, addDoctor, updateDoctor, updateDoctorImage, deleteDoctor, updateDoctorProfile } = require('../controllers/doctorController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllDoctors);
router.post('/', auth, adminOnly, upload.single('image'), addDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', auth, adminOnly, upload.single('image'), updateDoctor);
router.delete('/:id', auth, adminOnly, deleteDoctor);

// Doctor's own profile route
router.put('/profile/update', auth, upload.single('image'), updateDoctorProfile);
router.put('/profile/image', auth, upload.single('image'), updateDoctorImage);

module.exports = router;