import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

function Frame({ title, children, foot }) {
  return (
    <div className="auth">
      <div className="auth-card">
        <h1>CebuQueue</h1>
        <p className="muted">Skip the long wait at your barangay health center.</p>
        <h2>{title}</h2>
        {children}
        <p className="muted foot">{foot}</p>
        <p className="muted"><Link to="/board">See who is being served now</Link></p>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const r = await api('/auth/login', { method: 'POST', body: f }); login(r.token, r.user); }
    catch (x) { setErr(x.message); }
  };
  return (
    <Frame title="Log in" foot={<>New patient? <Link to="/register">Create an account</Link></>}>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn">Log in</button>
      </form>
    </Frame>
  );
}

export function Register() {
  const { login } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '', birthdate: '', address: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { const r = await api('/auth/register', { method: 'POST', body: f }); login(r.token, r.user); }
    catch (x) { setErr(x.message); }
  };
  return (
    <Frame title="Create your account" foot={<>Already registered? <Link to="/login">Log in</Link></>}>
      <form onSubmit={submit}>
        <label>Full name<input required value={f.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password (8+ characters)<input type="password" required minLength={8} value={f.password} onChange={set('password')} /></label>
        <label>Mobile number (for SMS alerts)<input inputMode="tel" placeholder="09xxxxxxxxx" value={f.phone} onChange={set('phone')} /></label>
        <label>Birthdate<input type="date" value={f.birthdate} onChange={set('birthdate')} /></label>
        <label>Address<input value={f.address} onChange={set('address')} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn">Create account</button>
      </form>
    </Frame>
  );
}
