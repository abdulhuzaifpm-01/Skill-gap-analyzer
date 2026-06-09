import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const FEATURES = [
  { icon: '🎯', title: 'Skill Gap Detection',    desc: 'Instantly identify missing skills for your dream role with precision analysis.' },
  { icon: '📊', title: 'Match Percentage',        desc: 'Get a clear score showing exactly how close you are to your target job.' },
  { icon: '🚀', title: 'Smart Recommendations',  desc: 'Receive curated learning resources tailored to each missing skill.' },
  { icon: '🎤', title: 'AI Mock Interview',       desc: 'Practice with Claude-generated role-specific interview questions.' },
  { icon: '📝', title: 'AI Aptitude Test',        desc: 'Fresh randomized MCQs every time — never the same test twice.' },
  { icon: '📄', title: 'Resume Parser',           desc: 'Upload your resume and AI extracts your actual skills automatically.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.13) 0%, transparent 70%)', top: -200, left: -200, animation: 'orbFloat 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', bottom: -150, right: -150, animation: 'orbFloat 11s ease-in-out infinite reverse' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)', animation: 'fadeInDown 0.5s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <span className="gradient-text" style={{ fontSize: 19, fontWeight: 800 }}>SkillGap Analyzer</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>About</Link>
          {user
            ? <button className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard →</button>
            : <>
                <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14 }}>Login</Link>
                <Link to="/register"><button className="btn-primary">Get Started Free</button></Link>
              </>
          }
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '90px 32px 50px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.14)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 40, padding: '6px 20px', marginBottom: 28, animation: 'fadeInDown 0.5s ease both' }}>
          <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 600 }}>🎓 AI-Powered Career Intelligence</span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,68px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 22, animation: 'fadeInUp 0.6s 0.1s ease both', letterSpacing: '-1.5px' }}>
          Discover Your<br /><span className="gradient-text">Skill Gaps</span> Instantly
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7, animation: 'fadeInUp 0.6s 0.2s ease both' }}>
          Enter your skills, select a job role, and see exactly what's holding you back — with AI-powered recommendations, interviews, and tests.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.6s 0.3s ease both' }}>
          {user
            ? <button className="btn-primary" style={{ fontSize: 16, padding: '13px 36px', animation: 'glow 2s ease-in-out infinite' }} onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
            : <>
                <Link to="/register"><button className="btn-primary" style={{ fontSize: 16, padding: '13px 36px', animation: 'glow 2s ease-in-out infinite' }}>Start Analyzing Free →</button></Link>
                <Link to="/login"><button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '13px 36px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Login</button></Link>
              </>
          }
        </div>
      </section>

      {/* Stats */}
      <section style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center', gap: 48, padding: '10px 32px 56px', flexWrap: 'wrap' }}>
        {[{ v: '8+', l: 'Job Roles' }, { v: '100%', l: 'AI Powered' }, { v: '3', l: 'Practice Modes' }, { v: 'Free', l: 'Always' }].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', animation: `fadeInUp 0.5s ${0.4 + i * 0.08}s ease both` }}>
            <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg,#6c63ff,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.v}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 5, padding: '20px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 44, letterSpacing: '-0.5px', animation: 'fadeInUp 0.5s ease both' }}>
          Everything You Need to <span className="gradient-text">Level Up</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glass" style={{ padding: '28px 24px', transition: 'all 0.3s', animation: `fadeInUp 0.5s ${i * 0.07}s ease both`, cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '0 32px 80px' }}>
          <div className="glass" style={{ maxWidth: 560, margin: '0 auto', padding: '44px 36px', animation: 'fadeInUp 0.6s ease both' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🚀</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Ready to bridge the gap?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>Free forever. No credit card required.</p>
            <Link to="/register"><button className="btn-primary" style={{ fontSize: 16, padding: '13px 40px' }}>Create Free Account</button></Link>
          </div>
        </section>
      )}
    </div>
  );
}
