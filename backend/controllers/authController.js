const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient', specialty, qualifications, fees, availableDays, gender } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(name, email, hashedPassword, role);

    if (role === 'doctor') {
      if (!specialty || !fees) {
        throw new Error('Specialty and fees are required for doctor registration');
      }
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      await Doctor.create(userId, specialty, qualifications, fees, availableDays, image, gender);
    } else if (role === 'patient') {
      await Patient.ensure(userId);
    }

    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error: due to hosting limit, please try again later' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error due to database hosting limit' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let extraData = {};
    if (user.role === 'doctor') {
      const doctor = await Doctor.findByUserId(user.id);
      extraData = { doctor };
    } else if (user.role === 'patient') {
      await Patient.ensure(user.id);
      const patient = await Patient.findByUserId(user.id);
      extraData = { patient };
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...extraData });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
