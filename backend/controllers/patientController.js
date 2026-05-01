const Patient = require('../models/Patient');
const User = require('../models/User');

const getPatientProfile = async (req, res) => {
  try {
    await Patient.ensure(req.user.id);
    const patient = await Patient.findByUserId(req.user.id);
    res.json({ patient });
  } catch (error) {
    console.error('GetPatientProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : req.body.profile_image;

    if (name !== undefined || email !== undefined) {
      await User.updateProfile(req.user.id, name, email);
    }

    await Patient.update(req.user.id, {
      phone,
      address,
      profile_image: profileImage,
    });

    const patient = await Patient.findByUserId(req.user.id);
    res.json({
      message: 'Profile updated successfully',
      patient,
      user: { id: req.user.id, name: patient.name, email: patient.email, role: req.user.role },
    });
  } catch (error) {
    console.error('UpdatePatientProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPatientProfile, updatePatientProfile };
