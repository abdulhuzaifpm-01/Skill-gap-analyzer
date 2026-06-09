import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const API = 'http://localhost:5000/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/register`, { name: form.name, email: form.email, password: form.password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    return s;
  })();
  const strengthColors = ['#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['Weak', 'Medium', 'Strong'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '32px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.11) 0%, transparent 70%)', top: -200, right: -200, animation: 'orbFloat 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', bottom: -100, left: -100, animation: 'orbFloat 8s ease-in-out infinite reverse' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32, justifyContent: 'center' }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>SkillGap Analyzer</span>
        </Link>

        <div className="glass" style={{ padding: '40px 36px', animation: 'fadeInUp 0.5s ease both' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>
            Already have one?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '11px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13, animation: 'fadeIn 0.3s ease both' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Full Name',         name: 'name',     type: 'text',     placeholder: 'John Doe' },
              { label: 'Email Address',     name: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',          name: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password',  name: 'confirm',  type: 'password', placeholder: '••••••••' },
            ].map(f => <Field key={f.name} {...f} value={form[f.name]} onChange={onChange} />)}

            {form.password && (
              <div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength ? strengthColors[strength-1] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />)}
                </div>
                {strength > 0 && <span style={{ fontSize: 11, color: strengthColors[strength-1], fontWeight: 600 }}>{strengthLabels[strength-1]} password</span>}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? <Spin text="Creating account..." /> : 'Create Account →'}
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
