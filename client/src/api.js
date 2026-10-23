import { useEffect, useRef, useState, useCallback } from 'react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('cq_token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

// Loads data now and refreshes every `ms`. Returns [data, error, reload].
export function usePoll(fn, deps = [], ms = 5000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const load = useCallback(() => fnRef.current().then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message)), []);
  useEffect(() => {
    load();
    const t = setInterval(load, ms);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [data, error, load];
}

export const age = (b) => (b ? Math.floor((Date.now() - new Date(b).getTime()) / 31557600000) : '');
export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
