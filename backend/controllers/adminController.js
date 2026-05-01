const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const getDashboard = async (req, res) => {
  try {
    const stats = await Appointment.getStats();
    const doctorsCount = (await Doctor.findAll()).length;
    const appointments = await Appointment.findAll();

    res.json({
      totalAppointments: stats.total,
      confirmedAppointments: stats.confirmed,
      pendingAppointments: stats.pending,
      cancelledAppointments: stats.cancelled,
      totalDoctors: doctorsCount,
      recentAppointments: appointments.slice(0, 10)
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findByUserId(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const stats = await Appointment.getStats(doctor.id);
    const appointments = await Appointment.findByDoctor(doctor.id);
    const visitingAppointments = await Appointment.findByPatient(req.user.id);

    res.json({
      totalAppointments: stats.total,
      confirmedAppointments: stats.confirmed,
      pendingAppointments: stats.pending,
      cancelledAppointments: stats.cancelled,
      totalEarnings: stats.total_earnings || 0,
      appointments: appointments.slice(0, 10),
      visitingAppointments: visitingAppointments.slice(0, 10)
    });
  } catch (error) {
    console.error('GetDoctorDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getDoctorDashboard };
