const express = require('express');
const router = express.Router();
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/me', auth, getPatientProfile);
router.put('/profile/update', auth, upload.single('image'), updatePatientProfile);

module.exports = router;
