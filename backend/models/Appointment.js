const pool = require('../config/db');

const Appointment = {
  async create(patientId, doctorId, appointmentDate, appointmentTime) {
    const [result] = await pool.execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [patientId, doctorId, appointmentDate, appointmentTime]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.specialty
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT a.*, d.name as doctor_name, d.specialty, d.fees
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );
    return rows;
  },

  async findByDoctor(doctorId) {
    const [rows] = await pool.execute(
      `SELECT a.*, p.name as patient_name, p.email as patient_email
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [doctorId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT a.*, p.name as patient_name, p.email as patient_email,
              u.name as doctor_name, d.specialty
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );
    return rows;
  },

  async updateStatus(id, status) {
    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  async getStats(doctorId = null) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'confirmed' THEN d.fees ELSE 0 END) as total_earnings
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
    `;
    const params = [];
    if (doctorId) {
      query += ' WHERE a.doctor_id = ?';
      params.push(doctorId);
    }
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }
};

module.exports = Appointment;