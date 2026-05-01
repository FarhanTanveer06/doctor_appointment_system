const pool = require('../config/db');

const Patient = {
  async ensure(userId) {
    const [rows] = await pool.execute('SELECT * FROM patients WHERE user_id = ?', [userId]);
    if (rows[0]) return rows[0];

    await pool.execute('INSERT INTO patients (user_id) VALUES (?)', [userId]);
    const [createdRows] = await pool.execute('SELECT * FROM patients WHERE user_id = ?', [userId]);
    return createdRows[0];
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name, u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [userId]
    );
    return rows[0];
  },

  async update(userId, data) {
    await this.ensure(userId);

    const fields = [];
    const params = [];

    if (data.phone !== undefined) {
      fields.push('phone = ?');
      params.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      params.push(data.address);
    }
    if (data.profile_image !== undefined) {
      fields.push('profile_image = ?');
      params.push(data.profile_image);
    }

    if (fields.length > 0) {
      params.push(userId);
      await pool.execute(`UPDATE patients SET ${fields.join(', ')} WHERE user_id = ?`, params);
    }
  }
};

module.exports = Patient;
