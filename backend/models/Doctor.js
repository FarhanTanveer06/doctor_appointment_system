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

  async update(id, data) {
    const fields = [];
    const params = [];
    
    if (data.specialty !== undefined) { fields.push('specialty = ?'); params.push(data.specialty); }
    if (data.qualifications !== undefined) { fields.push('qualifications = ?'); params.push(data.qualifications); }
    if (data.fees !== undefined) { fields.push('fees = ?'); params.push(data.fees); }
    if (data.available_days !== undefined) { fields.push('available_days = ?'); params.push(data.available_days); }
    if (data.image !== undefined) { fields.push('image = ?'); params.push(data.image); }
    if (data.gender !== undefined) { fields.push('gender = ?'); params.push(data.gender); }
    if (data.bmdc_reg_no !== undefined) { fields.push('bmdc_reg_no = ?'); params.push(data.bmdc_reg_no); }
    if (data.id_no !== undefined) { fields.push('id_no = ?'); params.push(data.id_no); }
    if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
    if (data.field_of_concentration !== undefined) { fields.push('field_of_concentration = ?'); params.push(data.field_of_concentration); }
    if (data.specializations !== undefined) { fields.push('specializations = ?'); params.push(data.specializations); }
    if (data.work_experience !== undefined) { fields.push('work_experience = ?'); params.push(data.work_experience); }
    if (data.education !== undefined) { fields.push('education = ?'); params.push(data.education); }
    
    if (fields.length > 0) {
      params.push(id);
      await pool.execute(
        `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
    }
  },

  async updateImage(id, image) {
    await pool.execute('UPDATE doctors SET image = ? WHERE id = ?', [image, id]);
  },

  // Chamber methods
  async addChamber(doctorId, chamberData) {
    const [result] = await pool.execute(
      'INSERT INTO doctor_chambers (doctor_id, chamber_name, chamber_address, available_days, appointment_time_start, appointment_time_end) VALUES (?, ?, ?, ?, ?, ?)',
      [doctorId, chamberData.chamber_name, chamberData.chamber_address, chamberData.available_days, chamberData.appointment_time_start, chamberData.appointment_time_end]
    );
    return result.insertId;
  },

  async getChambers(doctorId) {
    const [rows] = await pool.execute(
      'SELECT * FROM doctor_chambers WHERE doctor_id = ? ORDER BY id',
      [doctorId]
    );
    return rows;
  },

  async updateChamber(chamberId, chamberData) {
    const fields = [];
    const params = [];
    
    if (chamberData.chamber_name !== undefined) { fields.push('chamber_name = ?'); params.push(chamberData.chamber_name); }
    if (chamberData.chamber_address !== undefined) { fields.push('chamber_address = ?'); params.push(chamberData.chamber_address); }
    if (chamberData.available_days !== undefined) { fields.push('available_days = ?'); params.push(chamberData.available_days); }
    if (chamberData.appointment_time_start !== undefined) { fields.push('appointment_time_start = ?'); params.push(chamberData.appointment_time_start); }
    if (chamberData.appointment_time_end !== undefined) { fields.push('appointment_time_end = ?'); params.push(chamberData.appointment_time_end); }
    
    if (fields.length > 0) {
      params.push(chamberId);
      await pool.execute(
        `UPDATE doctor_chambers SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
    }
  },

  async deleteChamber(chamberId) {
    await pool.execute('DELETE FROM doctor_chambers WHERE id = ?', [chamberId]);
  },

  async delete(id) {
    await pool.execute('DELETE FROM doctors WHERE id = ?', [id]);
  }
};

module.exports = Doctor;