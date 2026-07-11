import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const API = "https://skill-gap-analyzer-cwvf.onrender.com/api";

const QUICK_SKILLS = ['HTML','CSS','JavaScript','TypeScript','React','Node.js','Express','MongoDB','Python','SQL','Git','Docker','AWS','React Native','Figma'];

/* ── tiny helpers ── */
function Spin({ text }) {
  return (
    <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
      <span style={{ width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite' }} />
      {text}
    </span>
  );
}
function ErrBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.3)',color:'#fb7185',padding:'11px 14px',borderRadius:10,fontSize:13,marginBottom:16,animation:'fadeIn 0.3s ease both' }}>⚠️ {msg}</div>;
}
function InfoBox({ msg }) {
  return <div style={{ background:'rgba(6,182,212,0.07)',border:'1px solid rgba(6,182,212,0.25)',color:'#22d3ee',padding:'11px 14px',borderRadius:10,fontSize:13,marginBottom:16 }}>🔑 {msg}</div>;
}
function Tag({ label, color='purple', onRemove, delay=0 }) {
  const palettes = {
    purple: { bg:'rgba(108,99,255,0.15)',border:'rgba(108,99,255,0.3)',text:'var(--primary-light)' },
    green:  { bg:'rgba(16,185,129,0.1)',border:'rgba(16,185,129,0.25)',text:'#34d399' },
    red:    { bg:'rgba(244,63,94,0.1)',border:'rgba(244,63,94,0.25)',text:'#fb7185' },
    cyan:   { bg:'rgba(6,182,212,0.1)',border:'rgba(6,182,212,0.3)',text:'#22d3ee' },
  };
  const p = palettes[color];
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,background:p.bg,border:`1px solid ${p.border}`,color:p.text,borderRadius:20,padding:'5px 12px',fontSize:13,fontWeight:500,animation:`tagPop 0.35s ${delay}s ease both` }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{ cursor:'pointer',opacity:0.6,fontSize:15,lineHeight:1,transition:'opacity 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>×</span>}
    </div>
  );
}
function SectionHead({ title, sub }) {
  return <div style={{ marginBottom:22 }}><h2 style={{ fontSize:22,fontWeight:800,marginBottom:5 }}>{title}</h2><p style={{ color:'var(--text-secondary)',fontSize:13 }}>{sub}</p></div>;
}
function Empty({ icon, msg, btnLabel, onBtn }) {
  return (
    <div className="glass" style={{ padding:'52px 32px',textAlign:'center' }}>
      <div style={{ fontSize:44,marginBottom:14,animation:'float 3s ease-in-out infinite' }}>{icon}</div>
      <p style={{ color:'var(--text-secondary)',marginBottom: onBtn ? 22 : 0 }}>{msg}</p>
      {onBtn && <button className="btn-primary" onClick={onBtn}>{btnLabel}</button>}
    </div>
  );
}
const inputSt = { width:'100%',padding:'11px 14px',borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.1)',color:'var(--text-primary)',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit' };
function jobIcon(r) { return({'Frontend Developer':'🎨','Backend Developer':'⚙️','Full Stack Developer':'🔮','Data Scientist':'📊','DevOps Engineer':'🛠️','UI/UX Designer':'✏️','Mobile Developer':'📱','Cloud Architect':'☁️'})[r]||'💼'; }
function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

/* ── Results sub-component ── */
function Results({ result }) {
  const { jobRole, matchPercentage, matchedSkills, missingSkills, recommendations } = result;
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => { c += 2; if (c >= matchPercentage) { setPct(matchPercentage); clearInterval(iv); } else setPct(c); }, 18);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t);
  }, [matchPercentage]);
  const col = matchPercentage >= 70 ? '#10b981' : matchPercentage >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <div>
      <SectionHead title={<>Results for <span className="gradient-text">{jobRole}</span></>} sub="Your complete skill gap breakdown." />
      <div className="glass" style={{ padding:32,marginBottom:18,textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:`radial-gradient(circle at center,${col}10,transparent 70%)`,pointerEvents:'none' }} />
        <div style={{ fontSize:68,fontWeight:900,color:col,lineHeight:1,animation:'countUp 0.6s 0.2s ease both' }}>{pct}%</div>
        <div style={{ color:'var(--text-secondary)',marginTop:6,marginBottom:18,fontSize:14 }}>Match Score</div>
        <div style={{ height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden',maxWidth:480,margin:'0 auto' }}>
          <div style={{ height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${col},${col}99)`,borderRadius:4,transition:'width 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display:'flex',justifyContent:'center',gap:28,marginTop:10,fontSize:13 }}>
          <span style={{ color:'#10b981' }}>✓ {matchedSkills.length} matched</span>
          <span style={{ color:'#f43f5e' }}>✗ {missingSkills.length} missing</span>
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18 }}>
        <div className="glass" style={{ padding:20 }}>
          <div style={{ fontWeight:700,color:'#10b981',fontSize:13,marginBottom:12 }}>✓ You Have ({matchedSkills.length})</div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>{matchedSkills.map((s,i)=><Tag key={s} label={s} color="green" delay={i*0.03} />)}{!matchedSkills.length&&<p style={{ color:'var(--text-secondary)',fontSize:13 }}>None yet.</p>}</div>
        </div>
        <div className="glass" style={{ padding:20 }}>
          <div style={{ fontWeight:700,color:'#f43f5e',fontSize:13,marginBottom:12 }}>✗ To Learn ({missingSkills.length})</div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>{missingSkills.map((s,i)=><Tag key={s} label={s} color="red" delay={i*0.03} />)}{!missingSkills.length&&<p style={{ color:'#10b981',fontSize:13,fontWeight:600 }}>🎉 You have all skills!</p>}</div>
        </div>
      </div>
      {recommendations.length > 0 && (
        <div className="glass" style={{ padding:22 }}>
          <h3 style={{ fontWeight:800,fontSize:15,marginBottom:14 }}>📚 Learning Resources</h3>
          {recommendations.map((r,i)=>(
            <a key={i} href={r.resource} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,textDecoration:'none',color:'var(--text-primary)',transition:'all 0.25s',marginBottom:8,animation:`slideInLeft 0.4s ${i*0.05}s ease both` }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(108,99,255,0.1)';e.currentTarget.style.transform='translateX(4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.transform='translateX(0)';}}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:30,height:30,borderRadius:7,background:'linear-gradient(135deg,rgba(108,99,255,0.3),rgba(6,182,212,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>📖</div>
                <span style={{ fontWeight:600,fontSize:13 }}>Learn {r.skill}</span>
              </div>
              <span style={{ color:'var(--primary)' }}>→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [tab, setTab] = useState('skills');
  const [toast, setToast] = useState('');

  /* skills */
  const [skills, setSkills]       = useState(user?.skills || []);
  const [input, setInput]         = useState('');
  const [sugg, setSugg]           = useState([]);
  const [saving, setSaving]       = useState(false);
  const [jobRoles, setJobRoles]   = useState([]);
  const [selJob, setSelJob]       = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]       = useState(null);

  /* resume */
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult]   = useState(null);
  const [resumeErr, setResumeErr]         = useState('');
  const [dragOver, setDragOver]           = useState(false);

  /* interview */
  const [iRole, setIRole]         = useState('');
  const [iLevel, setILevel]       = useState('Mid');
  const [iLoading, setILoading]   = useState(false);
  const [iQuestions, setIQuestions] = useState([]);
  const [iIdx, setIIdx]           = useState(0);
  const [iAnswer, setIAnswer]     = useState('');
  const [iFbLoading, setIFbLoading] = useState(false);
  const [iFeedback, setIFeedback] = useState('');
  const [iStarted, setIStarted]   = useState(false);
  const [iHistory, setIHistory]   = useState([]);
  const [iDone, setIDone]         = useState(false);
  const [iErr, setIErr]           = useState('');

  /* aptitude */
  const [aptLoading, setAptLoading]   = useState(false);
  const [aptQuestions, setAptQuestions] = useState([]);
  const [aptStarted, setAptStarted]   = useState(false);
  const [aptSel, setAptSel]           = useState({});
  const [aptDone, setAptDone]         = useState(false);
  const [aptFinal, setAptFinal]       = useState({});
  const [aptScore, setAptScore]       = useState(0);
  const [aptTimer, setAptTimer]       = useState(900);
  const [aptErr, setAptErr]           = useState('');
  const timerRef = useRef(null);
  const aptSelRef = useRef({});

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line

  useEffect(() => {
    if (input.trim().length > 1) {
      setSugg(QUICK_SKILLS.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !skills.map(x=>x.toLowerCase()).includes(s.toLowerCase())).slice(0,5));
    } else setSugg([]);
  }, [input, skills]);

  /* timer */
  useEffect(() => {
    if (aptStarted && !aptDone) {
      timerRef.current = setInterval(() => {
        setAptTimer(t => {
          if (t <= 1) { clearInterval(timerRef.current); submitApt(aptSelRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [aptStarted, aptDone]); // eslint-disable-line

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ── Skills ── */
  const addSkill = s => {
    const t = s.trim();
    if (!t || skills.map(x=>x.toLowerCase()).includes(t.toLowerCase())) return;
    setSkills(p => [...p, t.charAt(0).toUpperCase()+t.slice(1)]);
    setInput(''); setSugg([]);
  };
  const saveSkills = async () => {
    setSaving(true);
    try { const { data } = await axios.put(`${API}/skills`, { skills }, { headers }); login({ ...user, skills: data.skills }); showToast('✅ Skills saved!'); }
    catch { showToast('❌ Save failed'); } finally { setSaving(false); }
  };
  const fetchJobs = async () => { try { const { data } = await axios.get(`${API}/jobs`, { headers }); setJobRoles(data); } catch {} };
  const runAnalyze = async () => {
    if (!selJob) { showToast('⚠️ Pick a job role'); return; }
    setAnalyzing(true); setResult(null);
    try { const { data } = await axios.post(`${API}/analyze`, { jobRoleId: selJob }, { headers }); setResult(data); setTab('results'); }
    catch { showToast('❌ Analysis failed'); } finally { setAnalyzing(false); }
  };

  /* ── Resume ── */
  const handleFile = async file => {
    if (!file) return;
    if (!file.name.match(/\.(pdf|doc|docx|txt)$/i)) { setResumeErr('Please upload PDF, DOC, DOCX, or TXT.'); return; }
    setResumeErr(''); setResumeResult(null); setResumeLoading(true);
    const fd = new FormData(); fd.append('resume', file);
    try { const { data } = await axios.post(`${API}/ai/parse-resume`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }); setResumeResult(data); }
    catch (err) { setResumeErr(err.response?.data?.message || 'Resume parse failed. Check ANTHROPIC_API_KEY in Server/.env'); }
    finally { setResumeLoading(false); }
  };
  const applyResumeSkills = () => {
    const add = resumeResult.skills.filter(s => !skills.map(x=>x.toLowerCase()).includes(s.toLowerCase()));
    setSkills(p => [...p, ...add]);
    showToast(`✅ Added ${add.length} skills!`); setTab('skills');
  };

  /* ── Interview ── */
  const startInterview = async () => {
    if (!iRole) { showToast('⚠️ Pick a role'); return; }
    setIErr(''); setILoading(true); setIQuestions([]); setIIdx(0); setIHistory([]); setIDone(false); setIAnswer(''); setIFeedback('');
    try {
      const { data } = await axios.post(`${API}/ai/interview-questions`, { role: iRole, level: iLevel }, { headers });
      setIQuestions(data.questions); setIStarted(true);
    } catch (err) { setIErr(err.response?.data?.message || 'Could not generate questions. Is ANTHROPIC_API_KEY set?'); }
    finally { setILoading(false); }
  };
  const submitAnswer = async () => {
    if (!iAnswer.trim()) { showToast('⚠️ Write your answer first'); return; }
    setIFbLoading(true); setIFeedback('');
    try {
      const { data } = await axios.post(`${API}/ai/interview-feedback`, { role: iRole, level: iLevel, question: iQuestions[iIdx], answer: iAnswer }, { headers });
      setIFeedback(data.feedback);
      setIHistory(p => [...p, { q: iQuestions[iIdx], a: iAnswer, fb: data.feedback }]);
    } catch (err) { setIFeedback('Feedback error: ' + (err.response?.data?.message || 'Server error')); }
    finally { setIFbLoading(false); }
  };
  const nextQ = () => {
    if (iIdx + 1 >= iQuestions.length) { setIDone(true); return; }
    setIIdx(p=>p+1); setIAnswer(''); setIFeedback('');
  };
  const resetInterview = () => { setIStarted(false); setIQuestions([]); setIIdx(0); setIHistory([]); setIFeedback(''); setIAnswer(''); setIDone(false); setIErr(''); };

  /* ── Aptitude ── */
  const startApt = async () => {
    setAptErr(''); setAptLoading(true); setAptSel({}); aptSelRef.current = {}; setAptFinal({}); setAptDone(false); setAptTimer(900);
    try {
      const { data } = await axios.post(`${API}/ai/aptitude-questions`, { count: 15 }, { headers });
      setAptQuestions(data.questions); setAptStarted(true);
    } catch (err) { setAptErr(err.response?.data?.message || 'Could not generate questions. Is ANTHROPIC_API_KEY set?'); }
    finally { setAptLoading(false); }
  };
  const pickOpt = (qi, oi) => {
    if (aptDone) return;
    setAptSel(p => { const n = { ...p, [qi]: oi }; aptSelRef.current = n; return n; });
  };
  const submitApt = (sel) => {
    clearInterval(timerRef.current);
    let score = 0;
    aptQuestions.forEach((q,i) => { if (sel[i] === q.ans) score++; });
    setAptFinal(sel); setAptScore(score); setAptDone(true);
  };

  const TABS = [
    { id:'skills',    label:'🧠 Skills',    count: skills.length },
    { id:'analyze',   label:'🔍 Analyze',   count: null },
    { id:'results',   label:'📊 Results',   count: null },
    { id:'resume',    label:'📄 Resume',    count: null },
    { id:'interview', label:'🎤 Interview', count: null },
    { id:'aptitude',  label:'📝 Aptitude',  count: null },
  ];

  return (
    <div style={{ minHeight:'100vh',background:'var(--bg-dark)',display:'flex',flexDirection:'column' }}>

      {/* Nav */}
      <nav style={{ background:'rgba(15,15,26,0.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--border)',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',height:62,position:'sticky',top:0,zIndex:100 }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
          <span style={{ fontSize:20 }}>⚡</span>
          <span className="gradient-text" style={{ fontWeight:800,fontSize:15 }}>SkillGap Analyzer</span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:14 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13 }}>{user?.name?.[0]?.toUpperCase()}</div>
            <span style={{ fontWeight:600,fontSize:14 }}>{user?.name}</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background:'rgba(244,63,94,0.14)',border:'1px solid rgba(244,63,94,0.3)',color:'#fb7185',padding:'6px 14px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit' }}>Logout</button>
        </div>
      </nav>

      {/* Toast */}
      {toast && <div style={{ position:'fixed',top:74,right:22,background:'#1a1a2e',border:'1px solid var(--border)',color:'var(--text-primary)',padding:'11px 18px',borderRadius:12,zIndex:200,fontWeight:600,fontSize:13,animation:'slideInRight 0.3s ease both',boxShadow:'0 8px 28px rgba(0,0,0,0.4)' }}>{toast}</div>}

      {/* Tab bar */}
      <div style={{ borderBottom:'1px solid var(--border)',padding:'0 28px',display:'flex',gap:0,background:'rgba(15,15,26,0.7)',backdropFilter:'blur(10px)',overflowX:'auto',flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:'14px 16px',background:'none',border:'none',borderBottom:`2px solid ${tab===t.id?'var(--primary)':'transparent'}`,color:tab===t.id?'var(--primary)':'var(--text-secondary)',fontWeight:600,cursor:'pointer',fontSize:13,transition:'all 0.25s',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',fontFamily:'inherit' }}>
            {t.label}
            {t.count !== null && <span style={{ background:'var(--primary)',color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:10 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <main style={{ flex:1,padding:'28px',maxWidth:980,margin:'0 auto',width:'100%' }}>

        {/* ── SKILLS ── */}
        {tab === 'skills' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            <SectionHead title="My Skills" sub="Add all your current skills. Be accurate for best analysis results." />
            <div className="glass" style={{ padding:26,marginBottom:18,position:'relative' }}>
              <div style={{ display:'flex',gap:10 }}>
                <div style={{ flex:1,position:'relative' }}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSkill(input)} placeholder="Type a skill and press Enter..." style={inputSt} />
                  {sugg.length > 0 && (
                    <div style={{ position:'absolute',top:'110%',left:0,right:0,background:'#16213e',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',zIndex:60,boxShadow:'0 10px 28px rgba(0,0,0,0.4)' }}>
                      {sugg.map(s=><div key={s} onClick={()=>addSkill(s)} style={{ padding:'10px 14px',cursor:'pointer',fontSize:13,transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{s}</div>)}
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={()=>addSkill(input)} style={{ padding:'11px 20px',whiteSpace:'nowrap' }}>+ Add</button>
              </div>
              <div style={{ marginTop:14 }}>
                <span style={{ fontSize:11,color:'var(--text-secondary)',fontWeight:600,letterSpacing:'0.4px' }}>QUICK ADD: </span>
                {QUICK_SKILLS.filter(s=>!skills.map(x=>x.toLowerCase()).includes(s.toLowerCase())).slice(0,8).map(s=>(
                  <button key={s} onClick={()=>addSkill(s)} style={{ margin:'3px',padding:'3px 10px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.25)',color:'var(--primary-light)',borderRadius:20,cursor:'pointer',fontSize:11,fontFamily:'inherit' }}>+{s}</button>
                ))}
              </div>
            </div>
            {skills.length > 0
              ? <div className="glass" style={{ padding:22,marginBottom:18 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:13 }}>
                    <span style={{ fontWeight:700,fontSize:13 }}>Your Skills ({skills.length})</span>
                    <button onClick={()=>setSkills([])} style={{ background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',fontSize:12,fontFamily:'inherit' }}>Clear All</button>
                  </div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                    {skills.map((s,i)=><Tag key={i} label={s} onRemove={()=>setSkills(p=>p.filter((_,j)=>j!==i))} delay={Math.min(i*0.02,0.25)} />)}
                  </div>
                </div>
              : <Empty icon="🎯" msg="No skills yet. Type above or upload your resume!" />
            }
            <div style={{ display:'flex',gap:10,marginTop: skills.length > 0 ? 0 : 16 }}>
              <button className="btn-primary" onClick={saveSkills} disabled={saving} style={{ flex:1,padding:12 }}>{saving?<Spin text="Saving..." />:'💾 Save Skills'}</button>
              <button onClick={()=>setTab('analyze')} style={{ flex:1,padding:12,background:'rgba(6,182,212,0.13)',border:'1px solid rgba(6,182,212,0.3)',color:'#22d3ee',borderRadius:12,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit' }}>🔍 Analyze Now →</button>
            </div>
          </div>
        )}

        {/* ── ANALYZE ── */}
        {tab === 'analyze' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            <SectionHead title="Analyze Skill Gap" sub="Select a job role to see your match score and missing skills." />
            <div className="glass" style={{ padding:20,marginBottom:16,display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>🧠</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:14,marginBottom:2 }}>{skills.length} skills loaded</div>
                <div style={{ color:'var(--text-secondary)',fontSize:12 }}>{skills.slice(0,5).join(', ')}{skills.length>5?` +${skills.length-5} more`:''}</div>
              </div>
              <button onClick={()=>setTab('skills')} style={{ background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',padding:'6px 12px',borderRadius:8,cursor:'pointer',fontSize:12,fontFamily:'inherit' }}>Edit</button>
            </div>
            <div className="glass" style={{ padding:26,marginBottom:16 }}>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:14 }}>Select Target Job Role</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10 }}>
                {jobRoles.map((j,i)=>(
                  <div key={j._id} onClick={()=>setSelJob(j._id)}
                    style={{ padding:'14px 16px',borderRadius:12,border:`2px solid ${selJob===j._id?'var(--primary)':'rgba(255,255,255,0.07)'}`,background:selJob===j._id?'rgba(108,99,255,0.14)':'rgba(255,255,255,0.02)',cursor:'pointer',transition:'all 0.25s',animation:`fadeInUp 0.4s ${i*0.05}s ease both` }}>
                    <div style={{ fontSize:20,marginBottom:5 }}>{jobIcon(j.role)}</div>
                    <div style={{ fontWeight:600,fontSize:13 }}>{j.role}</div>
                    <div style={{ color:'var(--text-secondary)',fontSize:11,marginTop:2 }}>{j.requiredSkills.length} skills needed</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={runAnalyze} disabled={analyzing||!selJob} style={{ width:'100%',padding:13,fontSize:15 }}>
              {analyzing?<Spin text="Analyzing..." />:'🔍 Analyze Skill Gap'}
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {tab === 'results' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            {result ? <Results result={result} /> : <Empty icon="📊" msg="No results yet — run your analysis first!" btnLabel="🔍 Go Analyze" onBtn={()=>setTab('analyze')} />}
          </div>
        )}

        {/* ── RESUME ── */}
        {tab === 'resume' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            <SectionHead title="AI Resume Parser" sub="Upload your resume — Claude reads the actual content and extracts only real skills from your document." />
            <InfoBox msg={<>Requires <code style={{ background:'rgba(255,255,255,0.1)',padding:'1px 5px',borderRadius:4 }}>ANTHROPIC_API_KEY</code> in <code style={{ background:'rgba(255,255,255,0.1)',padding:'1px 5px',borderRadius:4 }}>Server/.env</code></>} />
            <ErrBox msg={resumeErr} />

            <div className="glass"
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
              onClick={()=>!resumeLoading&&document.getElementById('res-inp').click()}
              style={{ padding:'46px 28px',marginBottom:20,textAlign:'center',border:`2px dashed ${dragOver?'var(--primary)':'rgba(255,255,255,0.13)'}`,background:dragOver?'rgba(108,99,255,0.07)':'transparent',transition:'all 0.3s',cursor:resumeLoading?'default':'pointer',borderRadius:16 }}>
              <input id="res-inp" type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
              {resumeLoading
                ? <div>
                    <div style={{ width:46,height:46,border:'3px solid rgba(108,99,255,0.25)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 18px' }} />
                    <p style={{ fontWeight:700,fontSize:15,marginBottom:5 }}>Claude AI is reading your resume...</p>
                    <p style={{ color:'var(--text-secondary)',fontSize:13 }}>Extracting only skills actually present in your document</p>
                  </div>
                : <div>
                    <div style={{ fontSize:48,marginBottom:14,animation:'float 3s ease-in-out infinite' }}>📄</div>
                    <h3 style={{ fontWeight:700,fontSize:17,marginBottom:7 }}>Drop your resume here</h3>
                    <p style={{ color:'var(--text-secondary)',fontSize:13,marginBottom:18 }}>PDF, DOC, DOCX, or TXT — AI reads the real content</p>
                    <button className="btn-primary" style={{ pointerEvents:'none' }}>Browse File</button>
                  </div>
              }
            </div>

            {resumeResult && !resumeLoading && (
              <div style={{ animation:'fadeInUp 0.4s ease both' }}>
                <div className="glass" style={{ padding:26,marginBottom:16 }}>
                  <div style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:18,paddingBottom:16,borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:32,flexShrink:0 }}>📋</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:14 }}>{resumeResult.fileName}</div>
                      {resumeResult.experienceYears && <div style={{ color:'var(--text-secondary)',fontSize:12,marginTop:2 }}>~{resumeResult.experienceYears} years experience</div>}
                      {resumeResult.summary && <div style={{ color:'var(--text-secondary)',fontSize:12,marginTop:4,fontStyle:'italic' }}>{resumeResult.summary}</div>}
                    </div>
                    <div style={{ background:'rgba(16,185,129,0.14)',border:'1px solid rgba(16,185,129,0.3)',color:'#10b981',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,flexShrink:0 }}>✓ Parsed by AI</div>
                  </div>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:12 }}>🤖 Skills Found by Claude ({resumeResult.skills.length})</div>
                  {resumeResult.skills.length > 0
                    ? <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>{resumeResult.skills.map((s,i)=><Tag key={s} label={s} color="cyan" delay={i*0.04} />)}</div>
                    : <p style={{ color:'#f59e0b',fontSize:13 }}>⚠️ No skills found. Try a .txt version of your resume.</p>
                  }
                </div>
                <div style={{ display:'flex',gap:10 }}>
                  {resumeResult.skills.length > 0 && <button className="btn-primary" onClick={applyResumeSkills} style={{ flex:1,padding:12 }}>✅ Add All to My Profile</button>}
                  <button onClick={()=>setResumeResult(null)} style={{ padding:'12px 18px',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:12,cursor:'pointer',fontWeight:600,fontFamily:'inherit' }}>Upload Different File</button>
                </div>
              </div>
            )}

            {!resumeResult && !resumeLoading && (
              <div className="glass" style={{ padding:22 }}>
                <div style={{ fontWeight:700,fontSize:13,marginBottom:12 }}>💡 Tips for best results</div>
                {['Use .txt format — Claude reads plain text best','List skills explicitly: "Skills: React, Python, Docker"','Include tools, languages, frameworks, and platforms','AI only extracts skills actually in your resume — no guessing'].map((t,i)=>(
                  <div key={i} style={{ display:'flex',gap:8,marginBottom:10,animation:`slideInLeft 0.4s ${i*0.06}s ease both` }}>
                    <span style={{ color:'var(--primary)',fontWeight:700,flexShrink:0 }}>{i+1}.</span>
                    <span style={{ color:'var(--text-secondary)',fontSize:13 }}>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INTERVIEW ── */}
        {tab === 'interview' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            <SectionHead title="AI Mock Interview" sub="Claude generates unique questions for your role and gives real feedback on every answer — powered by the actual API." />
            <InfoBox msg={<>Requires <code style={{ background:'rgba(255,255,255,0.1)',padding:'1px 5px',borderRadius:4 }}>ANTHROPIC_API_KEY</code> in <code style={{ background:'rgba(255,255,255,0.1)',padding:'1px 5px',borderRadius:4 }}>Server/.env</code></>} />

            {!iStarted ? (
              <div>
                <ErrBox msg={iErr} />
                <div className="glass" style={{ padding:26,marginBottom:16 }}>
                  <div style={{ fontWeight:700,fontSize:14,marginBottom:18 }}>Configure Your Interview</div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.4px' }}>TARGET ROLE</div>
                      <select value={iRole} onChange={e=>setIRole(e.target.value)} style={{ ...inputSt,cursor:'pointer' }}>
                        <option value="">Select a role...</option>
                        {jobRoles.map(j=><option key={j._id} value={j.role}>{j.role}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.4px' }}>EXPERIENCE LEVEL</div>
                      <div style={{ display:'flex',gap:8 }}>
                        {['Junior','Mid','Senior'].map(l=>(
                          <button key={l} onClick={()=>setILevel(l)}
                            style={{ flex:1,padding:'10px 0',borderRadius:10,border:`2px solid ${iLevel===l?'var(--primary)':'rgba(255,255,255,0.09)'}`,background:iLevel===l?'rgba(108,99,255,0.18)':'transparent',color:iLevel===l?'var(--primary)':'var(--text-secondary)',cursor:'pointer',fontWeight:600,fontSize:13,transition:'all 0.25s',fontFamily:'inherit' }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18 }}>
                  {[{icon:'🤖',t:'AI-Generated',d:'Fresh unique questions every time'},{icon:'🎯',t:'Role-Tailored',d:'Specific to your role & level'},{icon:'💬',t:'Live Feedback',d:'Claude reviews each answer'}].map((c,i)=>(
                    <div key={i} className="glass" style={{ padding:'18px 16px',textAlign:'center',animation:`fadeInUp 0.4s ${i*0.08}s ease both` }}>
                      <div style={{ fontSize:26,marginBottom:8 }}>{c.icon}</div>
                      <div style={{ fontWeight:700,fontSize:13,marginBottom:4 }}>{c.t}</div>
                      <div style={{ color:'var(--text-secondary)',fontSize:11 }}>{c.d}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={startInterview} disabled={iLoading||!iRole} style={{ width:'100%',padding:13,fontSize:15 }}>
                  {iLoading?<Spin text="Claude is generating your questions..." />:'🎤 Start AI Mock Interview'}
                </button>
              </div>

            ) : iDone ? (
              <div style={{ animation:'fadeInUp 0.45s ease both' }}>
                <div className="glass" style={{ padding:32,marginBottom:18,textAlign:'center' }}>
                  <div style={{ fontSize:48,marginBottom:12,animation:'float 3s ease-in-out infinite' }}>🏆</div>
                  <h3 style={{ fontSize:20,fontWeight:800,marginBottom:6 }}>Interview Complete!</h3>
                  <p style={{ color:'var(--text-secondary)',fontSize:14 }}>{iHistory.length} questions · <span style={{ color:'var(--primary)',fontWeight:700 }}>{iRole}</span> · {iLevel}</p>
                </div>
                {iHistory.map((h,i)=>(
                  <div key={i} className="glass" style={{ padding:22,marginBottom:12,animation:`slideInLeft 0.4s ${i*0.06}s ease both` }}>
                    <div style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:12 }}>
                      <div style={{ background:'linear-gradient(135deg,#6c63ff,#06b6d4)',borderRadius:'50%',width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0 }}>Q{i+1}</div>
                      <span style={{ fontWeight:700,fontSize:14,lineHeight:1.4 }}>{h.q}</span>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.03)',borderRadius:9,padding:'10px 13px',marginBottom:9,borderLeft:'3px solid rgba(108,99,255,0.5)' }}>
                      <div style={{ fontSize:10,color:'var(--text-secondary)',marginBottom:3,fontWeight:600,letterSpacing:'0.4px' }}>YOUR ANSWER</div>
                      <div style={{ fontSize:13,lineHeight:1.6 }}>{h.a}</div>
                    </div>
                    <div style={{ background:'rgba(16,185,129,0.07)',borderRadius:9,padding:'10px 13px',borderLeft:'3px solid rgba(16,185,129,0.4)' }}>
                      <div style={{ fontSize:10,color:'#10b981',marginBottom:3,fontWeight:600,letterSpacing:'0.4px' }}>🤖 AI FEEDBACK</div>
                      <div style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.7 }}>{h.fb}</div>
                    </div>
                  </div>
                ))}
                <button className="btn-primary" onClick={resetInterview} style={{ width:'100%',padding:12,marginTop:6 }}>🔄 Start Another Interview</button>
              </div>

            ) : (
              <div style={{ animation:'fadeInUp 0.45s ease both' }}>
                <div className="glass" style={{ padding:'13px 22px',marginBottom:16,display:'flex',alignItems:'center',gap:14 }}>
                  <span style={{ fontWeight:700,fontSize:13,color:'var(--text-secondary)',whiteSpace:'nowrap' }}>Q {iIdx+1}/{iQuestions.length}</span>
                  <div style={{ flex:1,height:5,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${((iIdx+1)/iQuestions.length)*100}%`,background:'linear-gradient(90deg,#6c63ff,#06b6d4)',borderRadius:3,transition:'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize:12,color:'var(--primary)',fontWeight:600,whiteSpace:'nowrap' }}>{iRole} · {iLevel}</span>
                </div>

                <div className="glass" style={{ padding:26,marginBottom:16 }}>
                  <div style={{ display:'flex',gap:12,alignItems:'flex-start',marginBottom:20 }}>
                    <div style={{ background:'linear-gradient(135deg,#6c63ff,#06b6d4)',borderRadius:9,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,flexShrink:0 }}>Q{iIdx+1}</div>
                    <p style={{ fontSize:16,fontWeight:600,lineHeight:1.6,paddingTop:3 }}>{iQuestions[iIdx]}</p>
                  </div>
                  <div style={{ fontSize:11,fontWeight:600,color:'var(--text-secondary)',marginBottom:9,letterSpacing:'0.4px' }}>YOUR ANSWER</div>
                  <textarea value={iAnswer} onChange={e=>setIAnswer(e.target.value)} placeholder="Type your answer... Be detailed. Mention concepts, examples, and real experience." rows={6}
                    style={{ ...inputSt,resize:'vertical',lineHeight:1.7 }} />
                  <button className="btn-primary" onClick={submitAnswer} disabled={iFbLoading||!iAnswer.trim()} style={{ marginTop:14,width:'100%',padding:12 }}>
                    {iFbLoading?<Spin text="Claude is reviewing your answer..." />:'📤 Submit for AI Feedback'}
                  </button>
                </div>

                {iFeedback && (
                  <div style={{ animation:'fadeInUp 0.4s ease both' }}>
                    <div className="glass" style={{ padding:22,marginBottom:14,borderLeft:'3px solid #10b981' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
                        <span style={{ fontSize:16 }}>🤖</span>
                        <span style={{ fontWeight:700,color:'#10b981',fontSize:14 }}>Claude's Feedback</span>
                      </div>
                      <p style={{ color:'var(--text-secondary)',lineHeight:1.8,fontSize:13 }}>{iFeedback}</p>
                    </div>
                    <button className="btn-primary" onClick={nextQ} style={{ width:'100%',padding:12,fontSize:14 }}>
                      {iIdx+1 >= iQuestions.length ? '🏁 Finish & See Summary' : `Next Question (${iIdx+2}/${iQuestions.length}) →`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── APTITUDE ── */}
        {tab === 'aptitude' && (
          <div style={{ animation:'fadeInUp 0.45s ease both' }}>
            <SectionHead title="AI Aptitude Test" sub="Claude generates a completely fresh set of 15 randomized questions every attempt — different every time." />
            <InfoBox msg="Fully randomized by Claude AI — new questions on every attempt across DSA, Web, JS, React, Databases, Git, Logic & more." />

            {!aptStarted ? (
              <div>
                <ErrBox msg={aptErr} />
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20 }}>
                  {[{icon:'🎲',v:'15',l:'Random Qs'},{icon:'⏱️',v:'15 min',l:'Time Limit'},{icon:'🤖',v:'AI',l:'Generated Fresh'},{icon:'🏷️',v:'7+',l:'Topic Areas'}].map((s,i)=>(
                    <div key={i} className="glass" style={{ padding:'20px 14px',textAlign:'center',animation:`fadeInUp 0.4s ${i*0.07}s ease both` }}>
                      <div style={{ fontSize:26,marginBottom:7 }}>{s.icon}</div>
                      <div style={{ fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#6c63ff,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{s.v}</div>
                      <div style={{ color:'var(--text-secondary)',fontSize:12,marginTop:2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="glass" style={{ padding:22,marginBottom:20 }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:12 }}>🤖 AI-Generated Topics (randomized every time)</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                    {['DSA','Web Dev','JavaScript','React','Databases','Git & DevOps','System Design','OOP','Networking','Logical Reasoning'].map((t,i)=>(
                      <span key={i} style={{ background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.25)',color:'var(--primary-light)',borderRadius:20,padding:'4px 12px',fontSize:12 }}>{t}</span>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={startApt} disabled={aptLoading} style={{ width:'100%',padding:13,fontSize:15 }}>
                  {aptLoading?<Spin text="Claude is generating your unique test..." />:'🚀 Generate & Start Test'}
                </button>
              </div>

            ) : aptDone ? (
              <div style={{ animation:'fadeInUp 0.45s ease both' }}>
                <div className="glass" style={{ padding:40,marginBottom:20,textAlign:'center' }}>
                  <div style={{ fontSize:60,fontWeight:900,background:`linear-gradient(135deg,${aptScore/aptQuestions.length>=0.7?'#10b981,#06b6d4':aptScore/aptQuestions.length>=0.4?'#f59e0b,#f97316':'#f43f5e,#e11d48'})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6,animation:'countUp 0.5s 0.2s ease both' }}>
                    {aptScore}/{aptQuestions.length}
                  </div>
                  <div style={{ fontSize:20,fontWeight:700,marginBottom:5 }}>
                    {aptScore/aptQuestions.length>=0.7?'🎉 Excellent!':aptScore/aptQuestions.length>=0.4?'💪 Good Effort!':'📚 Keep Practicing!'}
                  </div>
                  <div style={{ color:'var(--text-secondary)',marginBottom:20,fontSize:14 }}>Score: {Math.round(aptScore/aptQuestions.length*100)}%</div>
                  <div style={{ height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden',maxWidth:380,margin:'0 auto' }}>
                    <div style={{ height:'100%',width:`${(aptScore/aptQuestions.length)*100}%`,background:aptScore/aptQuestions.length>=0.7?'linear-gradient(90deg,#10b981,#06b6d4)':aptScore/aptQuestions.length>=0.4?'linear-gradient(90deg,#f59e0b,#f97316)':'linear-gradient(90deg,#f43f5e,#e11d48)',borderRadius:4,transition:'width 1.5s ease' }} />
                  </div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:18 }}>
                  {aptQuestions.map((q,i)=>{
                    const sel = aptFinal[i]; const ok = sel === q.ans;
                    return (
                      <div key={i} className="glass" style={{ padding:18,borderLeft:`3px solid ${ok?'#10b981':sel!==undefined?'#f43f5e':'#f59e0b'}`,animation:`slideInLeft 0.4s ${i*0.03}s ease both` }}>
                        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:7 }}>
                          <span style={{ fontWeight:600,fontSize:13,flex:1,lineHeight:1.5 }}>Q{i+1}. {q.q}</span>
                          <span style={{ fontSize:16,marginLeft:8,flexShrink:0 }}>{ok?'✅':sel!==undefined?'❌':'⏭'}</span>
                        </div>
                        <div style={{ fontSize:12,color:'#10b981' }}>✓ {q.options[q.ans]}</div>
                        {sel!==undefined&&!ok&&<div style={{ fontSize:12,color:'#fb7185',marginTop:2 }}>✗ {q.options[sel]}</div>}
                        {sel===undefined&&<div style={{ fontSize:12,color:'#f59e0b',marginTop:2 }}>Skipped</div>}
                        <span style={{ display:'inline-block',marginTop:7,background:'rgba(108,99,255,0.09)',border:'1px solid rgba(108,99,255,0.2)',color:'var(--primary-light)',borderRadius:20,padding:'1px 9px',fontSize:10 }}>{q.cat}</span>
                      </div>
                    );
                  })}
                </div>
                <button className="btn-primary" onClick={()=>{setAptStarted(false);setAptDone(false);setAptQuestions([]);}} style={{ width:'100%',padding:12 }}>🎲 Generate New Test (Different Questions)</button>
              </div>

            ) : (
              <div>
                {/* Sticky timer */}
                <div className="glass" style={{ padding:'12px 22px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:62,zIndex:50,backdropFilter:'blur(20px)' }}>
                  <span style={{ fontWeight:700,fontSize:13 }}>AI Aptitude Test · {aptQuestions.length} Questions</span>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <span style={{ fontSize:12,color:'var(--text-secondary)' }}>{Object.keys(aptSel).length}/{aptQuestions.length} answered</span>
                    <div style={{ background:aptTimer<120?'rgba(244,63,94,0.18)':'rgba(108,99,255,0.14)',border:`1px solid ${aptTimer<120?'rgba(244,63,94,0.4)':'rgba(108,99,255,0.3)'}`,color:aptTimer<120?'#fb7185':'var(--primary)',padding:'5px 14px',borderRadius:20,fontWeight:800,fontSize:16,fontVariantNumeric:'tabular-nums',transition:'all 0.4s',animation:aptTimer<60?'pulse 1s ease-in-out infinite':'none' }}>
                      ⏱ {fmt(aptTimer)}
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex',flexDirection:'column',gap:13,marginBottom:18 }}>
                  {aptQuestions.map((q,qi)=>(
                    <div key={qi} className="glass" style={{ padding:22 }}>
                      <div style={{ display:'flex',gap:11,alignItems:'flex-start',marginBottom:14 }}>
                        <div style={{ width:26,height:26,borderRadius:'50%',background:aptSel[qi]!==undefined?'linear-gradient(135deg,#6c63ff,#06b6d4)':'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,transition:'background 0.3s' }}>{qi+1}</div>
                        <div style={{ flex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                          <span style={{ fontWeight:600,fontSize:14,lineHeight:1.5 }}>{q.q}</span>
                          <span style={{ background:'rgba(108,99,255,0.09)',border:'1px solid rgba(108,99,255,0.2)',color:'var(--primary-light)',borderRadius:20,padding:'2px 9px',fontSize:10,marginLeft:9,flexShrink:0 }}>{q.cat}</span>
                        </div>
                      </div>
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,paddingLeft:37 }}>
                        {q.options.map((opt,oi)=>(
                          <button key={oi} onClick={()=>pickOpt(qi,oi)}
                            style={{ padding:'9px 13px',borderRadius:9,border:`2px solid ${aptSel[qi]===oi?'var(--primary)':'rgba(255,255,255,0.07)'}`,background:aptSel[qi]===oi?'rgba(108,99,255,0.18)':'rgba(255,255,255,0.02)',color:aptSel[qi]===oi?'var(--text-primary)':'var(--text-secondary)',cursor:'pointer',textAlign:'left',fontSize:12,fontWeight:aptSel[qi]===oi?600:400,transition:'all 0.2s',fontFamily:'inherit' }}>
                            <span style={{ color:aptSel[qi]===oi?'var(--primary)':'var(--text-secondary)',fontWeight:700,marginRight:5 }}>{['A','B','C','D'][oi]}.</span>{opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={()=>submitApt(aptSel)} style={{ width:'100%',padding:13,fontSize:15 }}>
                  📤 Submit Test ({Object.keys(aptSel).length}/{aptQuestions.length} answered)
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
