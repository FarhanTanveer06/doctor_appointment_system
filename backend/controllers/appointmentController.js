const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const id = await Appointment.create(patientId, doctorId, appointmentDate, appointmentTime);
    const appointment = await Appointment.findById(id);

    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (error) {
    console.error('BookAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.findByPatient(req.user.id);
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      appointments = await Appointment.findByDoctor(doctor.id);
    } else {
      appointments = await Appointment.findAll();
    }
    res.json(appointments);
  } catch (error) {
    console.error('GetMyAppointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor || doctor.id !== appointment.doctor_id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await Appointment.updateStatus(req.params.id, 'confirmed');
    res.json({ message: 'Appointment confirmed' });
  } catch (error) {
    console.error('ConfirmAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findByUserId(req.user.id);
      if (!doctor || doctor.id !== appointment.doctor_id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await Appointment.updateStatus(req.params.id, 'cancelled');
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error('CancelAppointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { bookAppointment, getMyAppointments, confirmAppointment, cancelAppointment };