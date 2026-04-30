const pool = require('../config/db');

const Doctor = {
  async create(userId, specialty, qualifications, fees, availableDays, image = null, gender = 'Male') {
    const [result] = await pool.execute(
      'INSERT INTO doctors (user_id, specialty, qualifications, fees, available_days, image, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, specialty, qualifications, fees, availableDays, image, gender]
    );
    return result.insertId;
  },

  async findAll(specialty = null, gender = null) {
    let query = `
      SELECT d.*, u.name, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
    `;
    const params = [];
    let conditions = [];
    if (specialty) {
      conditions.push('d.specialty = ?');
      params.push(specialty);
    }
    if (gender) {
      conditions.push('d.gender = ?');
      params.push(gender);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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

  async update(id, specialty, qualifications, fees, availableDays, image = null, gender = null) {
    if (image && gender) {
      await pool.execute(
        'UPDATE doctors SET specialty = ?, qualifications = ?, fees = ?, available_days = ?, image = ?, gender = ? WHERE id = ?',
        [specialty, qualifications, fees, availableDays, image, gender, id]
      );
    } else if (image) {
      await pool.execute(
        'UPDATE doctors SET specialty = ?, qualifications = ?, fees = ?, available_days = ?, image = ? WHERE id = ?',
        [specialty, qualifications, fees, availableDays, image, id]
      );
    } else if (gender) {
      await pool.execute(
        'UPDATE doctors SET specialty = ?, qualifications = ?, fees = ?, available_days = ?, gender = ? WHERE id = ?',
        [specialty, qualifications, fees, availableDays, gender, id]
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