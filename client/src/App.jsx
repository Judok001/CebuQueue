import { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import { Login, Register } from './pages/Auth.jsx';
import Board from './pages/Board.jsx';
import { Book, MyQueue } from './pages/Patient.jsx';
import { StaffQueue, Patients } from './pages/Staff.jsx';
import { Reports, Manage } from './pages/Admin.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const MENU = {
  patient: [['/book', 'Get a number'], ['/my', 'My queue']],
  staff: [['/queue', 'Queue'], ['/patients', 'Patients']],
  admin: [['/reports', 'Reports'], ['/queue', 'Queue'], ['/patients', 'Patients'], ['/manage', 'Services & staff']],
};
const HOME = { patient: '/book', staff: '/queue', admin: '/reports' };

function Shell() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app">
      <aside className="side">
        <Link to="/" className="brand">CebuQueue</Link>
        <nav>
          {MENU[user.role].map(([to, text]) => <NavLink key={to} to={to}>{text}</NavLink>)}
          <NavLink to="/board" target="_blank">Now serving board</NavLink>
        </nav>
        <div className="who">
          <span>{user.name}</span>
          <button className="btn ghost light" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}

const Guard = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user.role) ? children : <Navigate to={HOME[user.role]} replace />;
};

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cq_user') || 'null'));
  const login = (token, u) => { localStorage.setItem('cq_token', token); localStorage.setItem('cq_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('cq_token'); localStorage.removeItem('cq_user'); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={HOME[user.role]} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={HOME[user.role]} replace /> : <Register />} />
          <Route path="/board" element={<Board />} />
          <Route element={<Shell />}>
            <Route path="/" element={user ? <Navigate to={HOME[user.role]} replace /> : null} />
            <Route path="/book" element={<Guard roles={['patient']}><Book /></Guard>} />
            <Route path="/my" element={<Guard roles={['patient']}><MyQueue /></Guard>} />
            <Route path="/queue" element={<Guard roles={['staff', 'admin']}><StaffQueue /></Guard>} />
            <Route path="/patients" element={<Guard roles={['staff', 'admin']}><Patients /></Guard>} />
            <Route path="/reports" element={<Guard roles={['admin']}><Reports /></Guard>} />
            <Route path="/manage" element={<Guard roles={['admin']}><Manage /></Guard>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
