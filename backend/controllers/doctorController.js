const Doctor = require('../models/Doctor');
const User = require('../models/User');

const getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await Doctor.findAll(specialty);
    res.json(doctors);
  } catch (error) {
    console.error('GetAllDoctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('GetDoctorById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addDoctor = async (req, res) => {
  try {
    const { userId, specialty, qualifications, fees, availableDays } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const id = await Doctor.create(userId, specialty, qualifications, fees, availableDays, image);
    res.status(201).json({ message: 'Doctor added', id, image });
  } catch (error) {
    console.error('AddDoctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { specialty, qualifications, fees, availableDays } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    await Doctor.update(req.params.id, specialty, qualifications, fees, availableDays, image);
    res.json({ message: 'Doctor updated', image });
  } catch (error) {
    console.error('UpdateDoctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDoctorImage = async (req, res) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    // req.params.id is user_id, we need to find doctor by user_id first
    const doctor = await Doctor.findByUserId(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found for this user' });
    }
    await Doctor.updateImage(doctor.id, image);
    res.json({ message: 'Image updated', image });
  } catch (error) {
    console.error('UpdateDoctorImage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, qualifications, fees, availableDays, name, email } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Get doctor by user_id from auth middleware
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    // Update doctor details
    await Doctor.update(doctor.id, specialty, qualifications, fees, availableDays, image);
    
    // Update user name and email if provided
    if (name || email) {
      await User.updateProfile(req.user.id, name, email);
    }
    
    // Fetch updated doctor data
    const updatedDoctor = await Doctor.findById(doctor.id);
    res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('UpdateDoctorProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    await Doctor.delete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (error) {
    console.error('DeleteDoctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllDoctors, getDoctorById, addDoctor, updateDoctor, updateDoctorImage, updateDoctorProfile, deleteDoctor };