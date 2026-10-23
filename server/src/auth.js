import jwt from 'jsonwebtoken';

export const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '8h' });

// requireAuth() = any logged-in user; requireAuth('staff','admin') = only those roles.
export const requireAuth = (...roles) => (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have access to this.' });
  next();
};

export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
