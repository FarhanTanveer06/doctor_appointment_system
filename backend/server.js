require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const patientRoutes = require('./routes/patients');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Doctor Appointment API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
