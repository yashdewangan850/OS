import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, LogOut, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'yashos_auth_token_v1';

function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY));
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const response = await fetch(`${API_URL}/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed.');
      localStorage.setItem(TOKEN_KEY, data.token); setUser(data.user); setMessage('Authentication successful.');
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  };

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null); setMessage('Logged out.'); };

  if (user) return <div className="flex h-full items-center justify-center bg-slate-950 p-8 text-white"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300"><ShieldCheck size={34}/></div><h2 className="mt-4 text-2xl font-bold">Welcome, {user.name}</h2><p className="mt-2 text-sm text-white/50">{user.email}</p><div className="mt-6 rounded-2xl bg-white/5 p-4 text-left text-xs text-white/60"><p><b className="text-white">JWT:</b> active session</p><p className="mt-1">Token is stored locally for this browser session.</p></div><button onClick={logout} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200 hover:bg-red-500/25"><LogOut size={16}/>Log out</button></div></div>;

  return <div className="flex h-full items-center justify-center bg-slate-950 p-6 text-white"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl"><div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">{mode === 'login' ? <LogIn/> : <UserPlus/>}</div><div><h2 className="text-xl font-bold">{mode === 'login' ? 'Sign in to YashOS' : 'Create YashOS account'}</h2><p className="text-xs text-white/45">Step 18 authentication demo</p></div></div>{mode === 'register' && <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="mb-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400"/>}<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="mb-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400"/><input required minLength={6} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password (6+ characters)" className="mb-4 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-400"/><button disabled={loading} className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50">{loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>{message && <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-white/65">{message}</p>}<button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('')}} className="mt-5 w-full text-xs text-violet-300 hover:text-violet-200">{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></form></div>;
}
export default Auth;
