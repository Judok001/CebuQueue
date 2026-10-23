import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { sign, wrap } from '../auth.js';

const router = Router();

// Patients register themselves: creates a login and a patient profile together.
router.post('/register', wrap(async (req, res) => {
  const { name, email, password, phone, birthdate, address } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const [exists] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (exists.length) return res.status(409).json({ error: 'That email is already registered. Try logging in.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password, 10);
    const [u] = await conn.query("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'patient')", [name, email, hash]);
    await conn.query('INSERT INTO patients (user_id, full_name, birthdate, phone, address) VALUES (?,?,?,?,?)',
      [u.insertId, name, birthdate || null, phone || null, address || null]);
    await conn.commit();
    const user = { id: u.insertId, name, role: 'patient' };
    res.status(201).json({ token: sign(user), user });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const [[u]] = await pool.query('SELECT * FROM users WHERE email=?', [email || '']);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash))) return res.status(401).json({ error: 'Wrong email or password.' });
  const user = { id: u.id, name: u.name, role: u.role };
  res.json({ token: sign(user), user });
}));

export default router;
