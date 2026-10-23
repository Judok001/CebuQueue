import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true, // return DATE/DATETIME as plain strings
  connectionLimit: 10,
});

// Use Philippine time so "today" and queue dates match the clinic's day.
pool.pool.on('connection', (c) => c.query("SET time_zone = '+08:00'"));

export default pool;
