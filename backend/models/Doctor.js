const pool = require('../config/db');

const Doctor = {
  async create(userId, specialty, qualifications, fees, availableDays, image = null) {
    const [result] = await pool.execute(
      'INSERT INTO doctors (user_id, specialty, qualifications, fees, available_days, image) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, specialty, qualifications, fees, availableDays, image]
    );
    return result.insertId;
  },

  async findAll(specialty = null) {
    let query = `
      SELECT d.*, u.name, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
    `;
    const params = [];
    if (specialty) {
      query += ' WHERE d.specialty = ?';
      params.push(specialty);
    }
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.*, u.name, u.email
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM doctors WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  },

  async update(id, specialty, qualifications, fees, availableDays, image = null) {
    if (image) {
      await pool.execute(
        'UPDATE doctors SET specialty = ?, qualifications = ?, fees = ?, available_days = ?, image = ? WHERE id = ?',
        [specialty, qualifications, fees, availableDays, image, id]
      );
    } else {
      await pool.execute(
        'UPDATE doctors SET specialty = ?, qualifications = ?, fees = ?, available_days = ? WHERE id = ?',
        [specialty, qualifications, fees, availableDays, id]
      );
    }
  },

  async updateImage(id, image) {
    await pool.execute('UPDATE doctors SET image = ? WHERE id = ?', [image, id]);
  },

  async delete(id) {
    await pool.execute('DELETE FROM doctors WHERE id = ?', [id]);
  }
};

module.exports = Doctor;