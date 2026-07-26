import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@honeywell.com', password: 'password123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Honeywell Campus Connect</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Smart Building Console</h1>
          <p className="mt-2 text-sm text-slate-400">Secure admin access to manage rooms, devices, and energy optimization.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
