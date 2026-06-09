import React from 'react';
import { Link } from 'react-router-dom';

const TECH = [
  { icon:'⚛️', name:'React.js',       desc:'Component-based UI' },
  { icon:'🟢', name:'Node.js + Express', desc:'REST API backend' },
  { icon:'🍃', name:'MongoDB',         desc:'NoSQL database' },
  { icon:'🔐', name:'JWT + bcrypt',    desc:'Secure auth' },
  { icon:'🤖', name:'Claude AI',       desc:'AI features' },
  { icon:'📡', name:'Axios',           desc:'HTTP client' },
];

const PHASES = [
  { n:'01', title:'Planning & Design',   desc:'Feature definition, wireframing, DB schema.' },
  { n:'02', title:'Database Setup',      desc:'MongoDB collections for Users & JobRoles with seed data.' },
  { n:'03', title:'Backend APIs',        desc:'Auth, skills CRUD, job listing, analysis, AI endpoints.' },
  { n:'04', title:'Frontend UI',         desc:'React pages with animations — all 5 pages.' },
  { n:'05', title:'AI Integration',      desc:'Claude AI for interviews, aptitude, resume parsing.' },
  { n:'06', title:'Testing & Polish',    desc:'Error handling, animations, UI refinements.' },
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', top: -150, right: -150, animation: 'orbFloat 10s ease-in-out infinite' }} />
      </div>

      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>SkillGap Analyzer</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
          <Link to="/register"><button className="btn-primary">Get Started</button></Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 5, maxWidth: 960, margin: '0 auto', padding: '56px 40px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeInUp 0.5s ease both' }}>
          <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.14)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 40, padding: '5px 18px', marginBottom: 22 }}>
            <span style={{ color: 'var(--primary-light)', fontSize: 13, fontWeight: 600 }}>🎓 Internship Project</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, marginBottom: 18, letterSpacing: '-1px' }}>
            About <span className="gradient-text">SkillGap Analyzer</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            A full-stack AI-powered web application built to help professionals identify skill gaps and accelerate career growth.
          </p>
        </div>

        {/* How it works */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>⚡ How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
            {[
              { step:'1', icon:'✍️', title:'Add Skills',     desc:'Add all skills you currently have.' },
              { step:'2', icon:'💼', title:'Pick a Role',    desc:'Choose from 8+ curated job roles.' },
              { step:'3', icon:'🔍', title:'Get Analysis',   desc:'See your match % and skill gaps.' },
              { step:'4', icon:'📈', title:'Learn & Grow',   desc:'Follow AI recommendations.' },
            ].map((s,i) => (
              <div key={i} className="glass" style={{ padding:'24px 20px', textAlign:'center', animation:`fadeInUp 0.5s ${i*0.08}s ease both`, transition:'transform 0.3s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#06b6d4)',margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15 }}>{s.step}</div>
                <div style={{ fontSize:26,marginBottom:10 }}>{s.icon}</div>
                <h3 style={{ fontWeight:700,fontSize:14,marginBottom:6 }}>{s.title}</h3>
                <p style={{ color:'var(--text-secondary)',fontSize:12,lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>🛠️ Tech Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 14 }}>
            {TECH.map((t,i) => (
              <div key={i} className="glass" style={{ padding:'18px 16px', animation:`tagPop 0.4s ${i*0.06}s ease both`, transition:'all 0.3s', cursor:'default' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(108,99,255,0.4)';e.currentTarget.style.transform='scale(1.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,0.2)';e.currentTarget.style.transform='scale(1)';}}>
                <div style={{ fontSize:26,marginBottom:8 }}>{t.icon}</div>
                <div style={{ fontWeight:700,fontSize:13,marginBottom:3 }}>{t.name}</div>
                <div style={{ color:'var(--text-secondary)',fontSize:11 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28 }}>🗺️ Development Roadmap</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PHASES.map((p,i) => (
              <div key={i} className="glass" style={{ padding:'18px 22px',display:'flex',alignItems:'center',gap:18,animation:`slideInLeft 0.5s ${i*0.07}s ease both`,transition:'all 0.3s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(108,99,255,0.4)';e.currentTarget.style.transform='translateX(4px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,0.2)';e.currentTarget.style.transform='translateX(0)';}}>
                <div style={{ width:42,height:42,borderRadius:10,background:'linear-gradient(135deg,rgba(108,99,255,0.3),rgba(6,182,212,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'var(--primary-light)',flexShrink:0 }}>P{p.n}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:14 }}>{p.title}</div>
                  <div style={{ color:'var(--text-secondary)',fontSize:13,marginTop:2 }}>{p.desc}</div>
                </div>
                <span style={{ fontSize:18 }}>✅</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="glass" style={{ padding:'44px 36px',textAlign:'center',animation:'fadeInUp 0.5s ease both' }}>
          <div style={{ fontSize:36,marginBottom:14 }}>🚀</div>
          <h3 style={{ fontSize:22,fontWeight:800,marginBottom:10 }}>Ready to discover your potential?</h3>
          <p style={{ color:'var(--text-secondary)',marginBottom:24,fontSize:15 }}>Start analyzing your skills and find your path to your dream job.</p>
          <Link to="/register"><button className="btn-primary" style={{ fontSize:15,padding:'13px 36px' }}>Get Started Free →</button></Link>
        </div>
      </div>
    </div>
  );
}
