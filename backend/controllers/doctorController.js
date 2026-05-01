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
    // Get chambers for this doctor
    const chambers = await Doctor.getChambers(doctor.id);
    res.json({ ...doctor, chambers });
  } catch (error) {
    console.error('GetDoctorById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addDoctor = async (req, res) => {
  try {
    const { userId, specialty, qualifications, fees, availableDays, gender } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const id = await Doctor.create(userId, specialty, qualifications, fees, availableDays, image, gender);
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
    const { 
      specialty, qualifications, fees, availableDays, name, email, gender,
      bmdc_reg_no, id_no, description, field_of_concentration, specializations, 
      work_experience, education, chambers
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    // Get doctor by user_id from auth middleware
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    // Build update data object with only provided fields
    const updateData = {};
    if (specialty !== undefined) updateData.specialty = specialty;
    if (qualifications !== undefined) updateData.qualifications = qualifications;
    if (fees !== undefined) updateData.fees = fees;
    if (availableDays !== undefined) updateData.available_days = availableDays;
    if (gender !== undefined) updateData.gender = gender;
    if (bmdc_reg_no !== undefined) updateData.bmdc_reg_no = bmdc_reg_no;
    if (id_no !== undefined) updateData.id_no = id_no;
    if (description !== undefined) updateData.description = description;
    if (field_of_concentration !== undefined) updateData.field_of_concentration = field_of_concentration;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (work_experience !== undefined) updateData.work_experience = work_experience;
    if (education !== undefined) updateData.education = education;
    if (image !== undefined) updateData.image = image;
    
    // Only update doctor if there's data to update
    if (Object.keys(updateData).length > 0) {
      await Doctor.update(doctor.id, updateData);
    }
    
    // Update user name and email if provided
    if (name !== undefined || email !== undefined) {
      await User.updateProfile(req.user.id, name, email);
    }
    
    // Update chambers if provided
    const parsedChambers = typeof chambers === 'string' ? JSON.parse(chambers) : chambers;
    if (Array.isArray(parsedChambers)) {
      // Delete existing chambers and add new ones
      const existingChambers = await Doctor.getChambers(doctor.id);
      for (const chamber of existingChambers) {
        await Doctor.deleteChamber(chamber.id);
      }
      // Add new chambers
      for (const chamber of parsedChambers) {
        if (chamber.chamber_name && chamber.chamber_address) {
          await Doctor.addChamber(doctor.id, chamber);
        }
      }
    }
    
    // Fetch updated doctor data with chambers
    const updatedDoctor = await Doctor.findById(doctor.id);
    const doctorChambers = await Doctor.getChambers(doctor.id);
    
    res.json({ 
      message: 'Profile updated successfully', 
      doctor: { ...updatedDoctor, chambers: doctorChambers }
    });
  } catch (error) {
    console.error('UpdateDoctorProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get doctor profile with chambers
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    const chambers = await Doctor.getChambers(doctor.id);
    res.json({ doctor: { ...doctor, chambers } });
  } catch (error) {
    console.error('GetDoctorProfile error:', error);
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

module.exports = { getAllDoctors, getDoctorById, addDoctor, updateDoctor, updateDoctorImage, updateDoctorProfile, deleteDoctor, getDoctorProfile };
