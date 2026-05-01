const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, addDoctor, updateDoctor, updateDoctorImage, deleteDoctor, updateDoctorProfile, getDoctorProfile } = require('../controllers/doctorController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllDoctors);
router.post('/', auth, adminOnly, upload.single('image'), addDoctor);

// Doctor's own profile route
router.put('/profile/update', auth, upload.single('image'), updateDoctorProfile);
router.put('/profile/image', auth, upload.single('image'), updateDoctorImage);
router.get('/profile/me', auth, getDoctorProfile);

router.get('/:id', getDoctorById);
router.put('/:id', auth, adminOnly, upload.single('image'), updateDoctor);
router.delete('/:id', auth, adminOnly, deleteDoctor);

module.exports = router;
