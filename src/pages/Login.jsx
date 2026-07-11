import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const API = "https://skill-gap-analyzer-cwvf.onrender.com/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '32px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', top: -150, left: -150, animation: 'orbFloat 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', bottom: -100, right: -100, animation: 'orbFloat 7s ease-in-out infinite reverse' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 36, justifyContent: 'center' }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>SkillGap Analyzer</span>
        </Link>

        <div className="glass" style={{ padding: '40px 36px', animation: 'fadeInUp 0.5s ease both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '11px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13, animation: 'fadeIn 0.3s ease both' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
            <div style={{ marginTop: 16 }}>
              <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 24 }}>
              {loading ? <Spin text="Signing in..." /> : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.4px' }}>{label.toUpperCase()}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${focused ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none', transition: 'all 0.25s' }} />
    </div>
  );
}

function Spin({ text }) {
  return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />{text}</span>;
}
