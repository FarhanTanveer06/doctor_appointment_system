const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'doctor_appointment_db',
  port: process.env.DB_PORT || 3306,  // ← ADD THIS
  ssl: {
    rejectUnauthorized: false          // ← ADD THIS for Railway
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;