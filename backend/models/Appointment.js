const pool = require('../config/db');

const Appointment = {
  async create(patientId, doctorId, appointmentDate, appointmentTime, appointmentType = 'new', chamberId = null) {
    // Try with new columns first, fall back to old format if columns don't exist
    try {
      const [result] = await pool.execute(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, chamber_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [patientId, doctorId, appointmentDate, appointmentTime, appointmentType, chamberId]
      );
      return result.insertId;
    } catch (error) {
      // If columns don't exist, try without them
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const [result] = await pool.execute(
          `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [patientId, doctorId, appointmentDate, appointmentTime]
        );
        return result.insertId;
      }
      throw error;
    }
  },

  async checkSlotConflict(doctorId, appointmentDate, appointmentTime) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
         AND status != 'cancelled'`,
        [doctorId, appointmentDate, appointmentTime]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      // If status check fails, just return no conflict
      return null;
    }
  },

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT a.*, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
                TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
                p.name as patient_name, p.email as patient_email,
                u.name as doctor_name, d.specialty, d.fees,
                c.chamber_name, c.chamber_address
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users u ON d.user_id = u.id
         LEFT JOIN doctor_chambers c ON a.chamber_id = c.id
         WHERE a.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      // Fallback if chamber columns don't exist
      const [rows] = await pool.execute(
        `SELECT a.*, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
                TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
                p.name as patient_name, p.email as patient_email,
                u.name as doctor_name, d.specialty, d.fees
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users u ON d.user_id = u.id
         WHERE a.id = ?`,
        [id]
      );
      return rows[0];
    }
  },

  async findByPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT a.*, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
              TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
              u.name as doctor_name, d.specialty, d.fees,
              c.chamber_name, c.chamber_address
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN doctor_chambers c ON a.chamber_id = c.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );
    return rows;
  },

  async findByDoctor(doctorId) {
    const [rows] = await pool.execute(
      `SELECT a.*, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
              TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
              p.name as patient_name, p.email as patient_email,
              c.chamber_name, c.chamber_address
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       LEFT JOIN doctor_chambers c ON a.chamber_id = c.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [doctorId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT a.*, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
              TIME_FORMAT(a.appointment_time, '%H:%i') as appointment_time,
              p.name as patient_name, p.email as patient_email,
              u.name as doctor_name, d.specialty, d.fees,
              c.chamber_name, c.chamber_address
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN doctor_chambers c ON a.chamber_id = c.id
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
