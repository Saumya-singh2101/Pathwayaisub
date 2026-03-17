/**
 * Dashboard.jsx — PathwayAI
 * Redesigned to match LandingPage aesthetic suite:
 * #0c0c0f base · Syne 800 headings · Instrument Serif italics
 * #7ecba1 green accent · JetBrains Mono for data/badges
 * No Tailwind · No emojis · No light/dark toggle
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

/* ─────────────────────────────────────────
   CSS — matching LandingPage design system
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Syne',sans-serif;background:#0c0c0f;color:#e8e6df;overflow-x:hidden}

::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,0.25);border-radius:10px}

/* ── Keyframes ── */
@keyframes blob-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,28px) scale(.97)}}
@keyframes fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes bar-fill{from{width:0}to{width:var(--w)}}
@keyframes ring-grow{from{stroke-dashoffset:var(--circ)}to{stroke-dashoffset:var(--off)}}
@keyframes soft-blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes ripple{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(2.2);opacity:0}}
@keyframes toast-in{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes ping-slow{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}
@keyframes shimmer-bar{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes progress-fill{from{width:0%}to{width:100%}}

.db-fade-up{animation:fade-up .65s cubic-bezier(.16,1,.3,1) both}
.db-fade-in{animation:fade-in .7s ease both}
.db-ping{animation:ping-slow 2.5s ease-out infinite}
.db-blink{animation:soft-blink 2.2s ease-in-out infinite}

.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
.d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.38s}
.d7{animation-delay:.46s}

/* ── Layout ── */
.db-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.db-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0;animation:blob-drift 14s ease-in-out infinite}
.db-pad{position:relative;z-index:1;padding:28px 32px;max-width:1360px;margin:0 auto}

/* ── Card ── */
.db-card{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  border-radius:20px;
  position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.db-card::before{
  content:'';position:absolute;inset:0;border-radius:20px;
  background:linear-gradient(135deg,rgba(126,203,161,.035),transparent 60%);
  pointer-events:none;
}
.db-card:hover{border-color:rgba(126,203,161,.15);transform:translateY(-2px)}
.db-card-inner{padding:22px}

/* ── Stat card ── */
.db-stat{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:18px;
  position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.db-stat:hover{border-color:rgba(126,203,161,.18);transform:translateY(-3px)}
.db-stat::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.05) 0%,transparent 60%);
  pointer-events:none;
}

/* ── Top bar ── */
.db-topbar{
  display:flex;align-items:flex-start;justify-content:space-between;
  margin-bottom:28px;
}

/* ── Section label ── */
.db-label{
  font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;
  margin-bottom:16px;
}

/* ── Nav button ── */
.db-nav-btn{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.6);
  font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;
  transition:all .2s;
}
.db-nav-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#e8e6df}

/* ── Icon btn ── */
.db-icon-btn{
  width:38px;height:38px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;position:relative;
  transition:all .2s;
}
.db-icon-btn:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.18)}

/* ── Progress bar ── */
.db-bar-fill{
  height:100%;border-radius:999px;
  animation:bar-fill 1.2s cubic-bezier(.16,1,.3,1) both;
}

/* ── Action row ── */
.db-action-row{
  display:flex;align-items:center;gap:12px;
  padding:11px 14px;border-radius:12px;
  border:1px solid transparent;
  background:transparent;
  cursor:pointer;width:100%;text-align:left;
  font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  color:rgba(232,230,223,.65);
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.db-action-row:hover{
  background:rgba(255,255,255,.04);
  border-color:rgba(255,255,255,.1);
  color:#e8e6df;
  transform:translateX(4px);
}

/* ── Plan row ── */
.db-plan-row{
  display:flex;align-items:center;gap:12px;
  padding:11px 12px;border-radius:12px;
  cursor:pointer;
  border:1px solid transparent;
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.db-plan-row:hover{
  background:rgba(255,255,255,.04);
  border-color:rgba(255,255,255,.08);
  transform:translateX(3px);
}

/* ── Tab pill ── */
.db-tab{
  padding:6px 16px;border-radius:999px;
  font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.03em;
  cursor:pointer;transition:all .22s ease;
  border:none;
}

/* ── Primary button ── */
.db-btn-primary{
  padding:11px 0;border-radius:12px;border:none;width:100%;
  background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);
  background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;
  cursor:pointer;transition:all .3s;
}
.db-btn-primary:hover{background-position:right;transform:translateY(-1px)}

/* ── Ghost button ── */
.db-btn-ghost{
  padding:11px 0;border-radius:12px;width:100%;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.03);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.db-btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:#e8e6df}

/* ── Badge ── */
.db-badge{
  display:inline-flex;align-items:center;
  padding:3px 9px;border-radius:6px;
  font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;
  background:rgba(126,203,161,.09);
  border:1px solid rgba(126,203,161,.2);
  color:#7ecba1;
}

/* ── Toast ── */
.db-toast{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  padding:13px 20px;border-radius:14px;
  background:rgba(20,20,24,.92);
  backdrop-filter:blur(24px);
  border:1px solid rgba(126,203,161,.2);
  box-shadow:0 12px 48px rgba(0,0,0,.5);
  color:#e8e6df;font-size:13px;font-weight:700;
  display:flex;align-items:center;gap:10px;
  animation:toast-in .4s cubic-bezier(.16,1,.3,1) both;
  font-family:'Syne',sans-serif;
}

/* ── Camera ── */
.db-cam{border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);line-height:0;position:relative}
.db-cam-glow{box-shadow:0 0 0 2px rgba(126,203,161,.25),0 8px 40px rgba(126,203,161,.15)}

/* ── Ripple ── */
.db-ripple{
  position:absolute;inset:-4px;border-radius:50%;
  border:1.5px solid var(--rc,#7ecba1);
  animation:ripple 2s ease-out infinite;
}

/* ── Credential card ── */
.db-cred{
  flex:1;padding:14px 8px;border-radius:14px;
  background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);
  display:flex;flex-direction:column;align-items:center;gap:6px;
  cursor:pointer;transition:all .28s;
}
.db-cred:hover{background:rgba(255,255,255,.055);transform:translateY(-3px)}

@media(max-width:980px){.main-grid{grid-template-columns:1fr !important}}
@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr) !important}.db-pad{padding:18px 16px !important}}
`;

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const GREEN  = "#7ecba1";
const GREEN2 = "#a8e6c4";

const ACCENT = {
  green:  { base: "#7ecba1",  dim: "rgba(126,203,161,.12)",  border: "rgba(126,203,161,.25)"  },
  blue:   { base: "#7eb5cb",  dim: "rgba(126,181,203,.12)",  border: "rgba(126,181,203,.25)"  },
  rose:   { base: "#cb7e9a",  dim: "rgba(203,126,154,.12)",  border: "rgba(203,126,154,.25)"  },
  amber:  { base: "#cba87e",  dim: "rgba(203,168,126,.12)",  border: "rgba(203,168,126,.25)"  },
};

const STATS = [
  { label: "Day Streak",     value: "12",     sub: "+2 this week",   accent: ACCENT.green, sym: "12" },
  { label: "Sessions / wk",  value: "6",      sub: "On track",       accent: ACCENT.blue,  sym: "6"  },
  { label: "Earned",          value: "2,400",  sub: "+400 today",    accent: ACCENT.rose,  sym: "Rs" },
  { label: "Credentials",    value: "3",      sub: "1 pending",      accent: ACCENT.amber, sym: "3"  },
];

const STRUGGLE = [
  { sub: "Mathematics", score: 62, tag: "Quadratic Eq.",  trend: -3, accent: ACCENT.blue  },
  { sub: "Science",     score: 78, tag: "Newton's Laws",  trend: +5, accent: ACCENT.green },
  { sub: "History",     score: 85, tag: "Freedom Mvmt.",  trend: +2, accent: ACCENT.rose  },
  { sub: "English",     score: 70, tag: "Essay Writing",  trend: +1, accent: ACCENT.amber },
];

const PLAN_INIT = [
  { time: "4:00 PM", sub: "Mathematics", topic: "Quadratic Equations — Factorisation", type: "Lesson", done: false, dur: "60 min", accent: ACCENT.blue  },
  { time: "5:00 PM", sub: "Science",     topic: "Newton's Laws — Quiz",               type: "Quiz",   done: true,  dur: "30 min", accent: ACCENT.green },
  { time: "5:30 PM", sub: "History",     topic: "Non-Cooperation Movement",           type: "Lesson", done: false, dur: "45 min", accent: ACCENT.rose  },
  { time: "6:15 PM", sub: "English",     topic: "Essay Writing — Argument Structure", type: "Lesson", done: false, dur: "40 min", accent: ACCENT.amber },
];

const ACTIONS = [
  { label: "Ask AI Tutor",     path: "/student/ai-tutor",    accent: ACCENT.green, code: "AI",  badge: null    },
  { label: "Take a Quiz",      path: "/student/quiz",        accent: ACCENT.blue,  code: "QZ",  badge: "3 new" },
  { label: "Find a Mentor",    path: "/student/mentors",     accent: ACCENT.rose,  code: "MT",  badge: null    },
  { label: "Credentials",      path: "/student/credentials", accent: ACCENT.amber, code: "CR",  badge: "Ready" },
  { label: "Browse Employers", path: "/student/employers",   accent: ACCENT.green, code: "EM",  badge: null    },
  { label: "Study Plan",       path: "/student/study-plan",  accent: ACCENT.blue,  code: "SP",  badge: null    },
];

const WEEKLY = [
  { d:"MON", n:3, goal:3 },{ d:"TUE", n:4, goal:3 },{ d:"WED", n:2, goal:3 },
  { d:"THU", n:3, goal:3 },{ d:"FRI", n:1, goal:3 },{ d:"SAT", n:0, goal:3 },{ d:"SUN", n:0, goal:3 },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SLabel({ children, accent = GREEN }) {
  return (
    <div className="db-label" style={{ color: accent }}>
      {children}
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 11H2L8 2Z" fill={GREEN} opacity=".85"/>
      <circle cx="8" cy="11" r="2.5" fill={GREEN}/>
    </svg>
  );
}

function RingProgress({ value, size = 52, stroke = 3, accent = GREEN }) {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={accent + "22"} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={accent} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)", filter:`drop-shadow(0 0 4px ${accent}70)` }}
      />
    </svg>
  );
}

function WeekChart() {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:64 }}>
      {WEEKLY.map((d, i) => {
        const pct  = Math.min(d.n / d.goal, 1);
        const now  = i === 2;
        const done = d.n >= d.goal;
        const bg   = now
          ? `linear-gradient(180deg,${GREEN2},${GREEN})`
          : done
          ? `linear-gradient(180deg,rgba(126,203,161,.55),rgba(126,203,161,.35))`
          : "rgba(255,255,255,.07)";
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div style={{ width:"100%", height:52, borderRadius:8, overflow:"hidden", background:"rgba(255,255,255,.05)", position:"relative" }}>
              <div style={{
                position:"absolute", bottom:0, left:0, right:0,
                height:`${pct * 100}%`,
                background: bg,
                borderRadius:"6px 6px 0 0",
                boxShadow: now ? `0 -4px 12px ${GREEN}50` : "none",
                transition:"height 1.2s cubic-bezier(.16,1,.3,1)",
              }}/>
            </div>
            <span style={{ fontSize:9, fontWeight:700, color: now ? GREEN : done ? "rgba(126,203,161,.5)" : "rgba(232,230,223,.22)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".04em" }}>{d.d}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  const videoRef  = useRef(null);
  const [letter,    setLetter]    = useState("");
  const [detecting, setDetecting] = useState(false);
  const [camReady,  setCamReady]  = useState(false);
  const [camError,  setCamError]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [plan,      setPlan]      = useState(PLAN_INIT);
  const [tab,       setTab]       = useState("plan");
  const [history,   setHistory]   = useState([]);
  const [clock,     setClock]     = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => { if (videoRef.current) { videoRef.current.srcObject = s; setCamReady(true); } })
      .catch(() => setCamError(true));
    return () => { if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop()); };
  }, []);

  const showToast = (msg, accent = GREEN) => {
    setToast({ msg, accent });
    setTimeout(() => setToast(null), 3000);
  };

  const detect = async () => {
    if (!videoRef.current || detecting) return;
    setDetecting(true); setLetter("");
    const c = document.createElement("canvas");
    c.width = 300; c.height = 300;
    c.getContext("2d").drawImage(videoRef.current, 0, 0, 300, 300);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg"));
    const fd   = new FormData(); fd.append("file", blob);
    try {
      const res  = await fetch("http://127.0.0.1:8000/detect-sign", { method:"POST", body:fd });
      const data = await res.json();
      const l    = data.letter || data.word || data.result || JSON.stringify(data);
      setLetter(l);
      setHistory(h => [{ l, t: clock.toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit" }) }, ...h.slice(0,4)]);
      showToast(`Detected: ${l}`);
    } catch {
      setLetter("Backend offline");
      showToast("Could not reach backend", ACCENT.rose.base);
    } finally { setDetecting(false); }
  };

  const togglePlan = (i) => {
    setPlan(prev => {
      const n = [...prev]; n[i] = { ...n[i], done: !n[i].done };
      if (n[i].done) showToast(`${n[i].sub} complete!`);
      return n;
    });
  };

  const hr    = clock.getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const name  = user?.name || "Kavya";
  const done  = plan.filter(p => p.done).length;
  const pct   = Math.round((done / plan.length) * 100);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── TOAST ── */}
      {toast && (
        <div className="db-toast">
          <div style={{ width:8, height:8, borderRadius:"50%", background:toast.accent, flexShrink:0, boxShadow:`0 0 8px ${toast.accent}` }}/>
          {toast.msg}
        </div>
      )}

      {/* ── ROOT ── */}
      <div className="db-root">

        {/* ── AMBIENT BLOBS ── */}
        <div className="db-blob" style={{ width:560, height:560, background:"rgba(126,203,161,0.05)", top:-160, right:-140 }}/>
        <div className="db-blob" style={{ width:400, height:400, background:"rgba(80,100,200,0.03)", bottom:160, left:-100, filter:"blur(110px)", animationDelay:"4s", animationDuration:"18s" }}/>
        <div className="db-blob" style={{ width:280, height:280, background:"rgba(126,203,161,0.025)", top:"45%", left:"35%", filter:"blur(100px)", animationDelay:"8s", animationDuration:"22s" }}/>

        {/* ── MAIN CONTENT ── */}
        <div className="db-pad">

          {/* ════ TOP BAR ════ */}
          <div className="db-topbar db-fade-up">

            {/* Identity */}
            <div>
              {/* Eyebrow row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                {/* live ripple dot */}
                <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
                  <div className="db-ping" style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>{greet}</span>
                <span style={{ color:"rgba(255,255,255,.15)", fontSize:11 }}>·</span>
                <span style={{ fontSize:11, fontWeight:500, color:"rgba(232,230,223,.25)", fontFamily:"'JetBrains Mono',monospace" }}>
                  {clock.toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit" })}
                </span>
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(36px,4vw,54px)", fontWeight:800, lineHeight:1.0, letterSpacing:"-.04em", color:"#f0ede6", margin:0 }}>
                Ready to learn,{" "}
                <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:GREEN }}>
                  {name}.
                </span>
              </h1>

              {/* Sub info */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                <div style={{ height:1, width:20, background:`linear-gradient(90deg,${GREEN},transparent)` }}/>
                <span style={{ fontSize:13, color:"rgba(232,230,223,.35)", fontWeight:600 }}>
                  {done} of {plan.length} tasks complete today
                </span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginTop:6 }}>
              {/* notification */}
              <button className="db-icon-btn" onClick={() => showToast("3 new notifications")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(232,230,223,.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div style={{ position:"absolute", top:7, right:7, width:6, height:6, borderRadius:"50%", background:ACCENT.rose.base, border:"1.5px solid #0c0c0f" }}/>
              </button>

              {/* home */}
              <button className="db-nav-btn" onClick={() => navigate("/")}>Home</button>

              {/* logo mark */}
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(126,203,161,.1)", border:"1px solid rgba(126,203,161,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <LogoMark/>
              </div>
            </div>
          </div>

          {/* ════ STAT CARDS ════ */}
          <div className="db-fade-up d1 stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:12 }}>
            {STATS.map((s) => (
              <div key={s.label} className="db-stat" style={{ padding:"20px 22px" }}>
                {/* top accent stripe */}
                <div style={{ position:"absolute", top:0, left:18, right:18, height:2, borderRadius:"0 0 4px 4px", background:s.accent.base, opacity:.55 }}/>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:s.accent.dim, border:`1px solid ${s.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:500, color:s.accent.base }}>{s.sym}</span>
                  </div>
                  <span style={{ fontSize:11, color:"rgba(232,230,223,.3)", fontWeight:600 }}>{s.sub}</span>
                </div>

                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:40, fontWeight:500, fontStyle:"italic", color:"#f0ede6", lineHeight:1, marginBottom:4 }}>
                  {s.value}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".05em", textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Progress strip ── */}
          <div className="db-fade-up d1 db-card" style={{ marginBottom:20, padding:"14px 22px", borderRadius:16, display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Today's Progress</span>
            <div style={{ flex:1, height:5, borderRadius:999, background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
              <div className="db-bar-fill" style={{
                "--w":`${pct}%`, width:`${pct}%`,
                background:`linear-gradient(90deg,${GREEN},${GREEN2})`,
                boxShadow:`0 0 10px ${GREEN}60`,
              }}/>
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:500, color:GREEN, whiteSpace:"nowrap" }}>{pct}%</span>
          </div>

          {/* ════ MAIN GRID ════ */}
          <div className="main-grid" style={{ display:"grid", gridTemplateColumns:"minmax(0,1.85fr) minmax(0,1fr)", gap:16 }}>

            {/* ══ LEFT COLUMN ══ */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* SIGN DETECTION */}
              <div className="db-fade-up d2 db-card">
                <div className="db-card-inner">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <SLabel accent={GREEN}>Sign Language Detection</SLabel>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                      <div className="db-blink" style={{ width:7, height:7, borderRadius:"50%", background:camReady ? GREEN : ACCENT.rose.base, boxShadow:`0 0 6px ${camReady ? GREEN : ACCENT.rose.base}` }}/>
                      <span style={{ fontSize:11, fontWeight:700, color:camReady ? GREEN : ACCENT.rose.base, letterSpacing:".04em" }}>
                        {camReady ? "Camera ready" : camError ? "Access denied" : "Connecting..."}
                      </span>
                    </div>
                  </div>

                  {camError ? (
                    <div style={{ padding:"36px", border:"1px dashed rgba(255,255,255,.1)", borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(232,230,223,.3)" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      </div>
                      <p style={{ fontSize:14, fontWeight:700, color:"rgba(232,230,223,.45)" }}>Camera unavailable</p>
                      <p style={{ fontSize:12, color:"rgba(232,230,223,.25)", textAlign:"center", lineHeight:1.65 }}>Allow camera access in your browser settings to use sign detection.</p>
                    </div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      {/* Camera feed */}
                      <div>
                        <div className={`db-cam ${camReady ? "db-cam-glow" : ""}`}>
                          <video ref={videoRef} autoPlay muted playsInline
                            style={{ width:"100%", display:"block", aspectRatio:"4/3", objectFit:"cover", background:"#0a0a0d" }}/>
                          {/* scan line */}
                          {detecting && (
                            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${GREEN},transparent)`, animation:"progress-fill 1.2s ease-in-out infinite" }}/>
                          )}
                        </div>
                        <button
                          onClick={detect}
                          disabled={!camReady || detecting}
                          style={{
                            marginTop:10, width:"100%", padding:"11px",
                            border:"none", borderRadius:12,
                            background: !camReady ? "rgba(255,255,255,.04)" : `linear-gradient(135deg,${GREEN},${GREEN2},${GREEN})`,
                            backgroundSize:"200%",
                            color: !camReady ? "rgba(232,230,223,.2)" : "#0c2018",
                            fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800,
                            letterSpacing:".06em", textTransform:"uppercase",
                            cursor: camReady ? "pointer" : "default",
                            transition:"all .3s",
                          }}
                        >
                          {detecting ? "Detecting..." : "Detect Sign"}
                        </button>
                      </div>

                      {/* Result panel */}
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        <div style={{ flex:1, minHeight:120, borderRadius:14, border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.025)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16, position:"relative" }}>
                          {letter ? (
                            <>
                              <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:56, fontWeight:500, color:GREEN, lineHeight:1, filter:`drop-shadow(0 0 20px ${GREEN}60)` }}>{letter}</div>
                              <div style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", letterSpacing:".12em", textTransform:"uppercase", marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>Detected</div>
                            </>
                          ) : (
                            <div style={{ textAlign:"center" }}>
                              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(126,203,161,.08)", border:"1px solid rgba(126,203,161,.18)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </div>
                              <p style={{ fontSize:12, color:"rgba(232,230,223,.3)", lineHeight:1.65 }}>Show a sign to the camera and press Detect</p>
                            </div>
                          )}
                        </div>

                        {/* History */}
                        {history.length > 0 && (
                          <div style={{ borderRadius:12, border:"1px solid rgba(255,255,255,.06)", background:"rgba(255,255,255,.02)", padding:"10px 12px" }}>
                            <div style={{ fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(126,203,161,.5)", fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>History</div>
                            {history.map((h, i) => (
                              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0", borderBottom: i < history.length-1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                                <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:18, color:GREEN }}>{h.l}</span>
                                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(232,230,223,.2)" }}>{h.t}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PERFORMANCE INDEX */}
              <div className="db-fade-up d3 db-card">
                <div className="db-card-inner">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <SLabel>Performance Index</SLabel>
                    <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.25)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:16, fontFamily:"'JetBrains Mono',monospace" }}>Lower = needs focus</span>
                  </div>

                  {STRUGGLE.map((s, i) => (
                    <div key={s.sub}
                      onClick={() => navigate(`/student/study-plan?subject=${s.sub}`)}
                      style={{ padding:"14px 0", borderBottom: i < STRUGGLE.length-1 ? "1px solid rgba(255,255,255,.05)" : "none", cursor:"pointer", transition:"padding-left .22s" }}
                      onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"}
                      onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:s.accent.base, flexShrink:0, boxShadow:`0 0 6px ${s.accent.base}80` }}/>
                          <span style={{ fontSize:14, fontWeight:700, color:"#f0ede6" }}>{s.sub}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:11, color:"rgba(232,230,223,.3)", fontWeight:600 }}>{s.tag}</span>
                          <span style={{
                            fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:6,
                            fontFamily:"'JetBrains Mono',monospace",
                            background: s.trend > 0 ? "rgba(126,203,161,.1)" : "rgba(203,126,154,.1)",
                            color: s.trend > 0 ? GREEN : ACCENT.rose.base,
                            border: `1px solid ${s.trend > 0 ? "rgba(126,203,161,.2)" : "rgba(203,126,154,.2)"}`,
                          }}>
                            {s.trend > 0 ? "+" : ""}{s.trend}%
                          </span>
                          <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:24, fontWeight:500, color:s.accent.base, minWidth:32, textAlign:"right", filter:`drop-shadow(0 0 6px ${s.accent.base}60)` }}>
                            {s.score}
                          </span>
                        </div>
                      </div>
                      <div style={{ height:4, borderRadius:999, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                        <div className="db-bar-fill" style={{
                          "--w":`${s.score}%`, width:`${s.score}%`,
                          background:`linear-gradient(90deg,${s.accent.base}60,${s.accent.base})`,
                          boxShadow:`0 0 8px ${s.accent.base}50`,
                          animationDelay:`${i * 0.1}s`,
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STUDY PLAN / WEEKLY */}
              <div className="db-fade-up d4 db-card">
                <div className="db-card-inner">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    {/* tabs */}
                    <div style={{ display:"flex", gap:3, padding:3, borderRadius:999, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.06)" }}>
                      {[["plan","Today's Plan"],["weekly","Weekly"]].map(([t, l]) => (
                        <button key={t} className="db-tab" onClick={() => setTab(t)} style={{
                          background: tab===t ? "rgba(126,203,161,.12)" : "transparent",
                          color: tab===t ? GREEN : "rgba(232,230,223,.35)",
                          border: tab===t ? "1px solid rgba(126,203,161,.2)" : "1px solid transparent",
                        }}>{l}</button>
                      ))}
                    </div>
                    <button onClick={() => navigate("/student/study-plan")} style={{
                      fontSize:12, color:GREEN, fontWeight:700, background:"none", border:"none",
                      cursor:"pointer", fontFamily:"'Syne',sans-serif", letterSpacing:".02em",
                    }}>
                      Full plan →
                    </button>
                  </div>

                  {tab === "plan" ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                      {plan.map((item, i) => (
                        <div key={i} className="db-plan-row" onClick={() => togglePlan(i)} style={{ opacity: item.done ? 0.45 : 1 }}>
                          {/* checkbox */}
                          <div style={{
                            width:18, height:18, borderRadius:6, flexShrink:0,
                            border:`1.5px solid ${item.done ? GREEN : "rgba(255,255,255,.15)"}`,
                            background: item.done ? "rgba(126,203,161,.12)" : "rgba(255,255,255,.03)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all .25s",
                          }}>
                            {item.done && <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>

                          {/* accent bar */}
                          <div style={{ width:3, height:26, borderRadius:4, background: item.done ? "rgba(255,255,255,.08)" : item.accent.base, flexShrink:0, boxShadow: item.done ? "none" : `0 0 6px ${item.accent.base}70` }}/>

                          <span style={{ fontSize:11, color:"rgba(232,230,223,.3)", width:54, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>{item.time}</span>

                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.25)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>{item.sub}</div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#e8e6df", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration:item.done ? "line-through" : "none" }}>
                              {item.topic}
                            </div>
                          </div>

                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                            <span style={{
                              fontSize:9, fontWeight:800, padding:"3px 9px", borderRadius:6,
                              fontFamily:"'JetBrains Mono',monospace",
                              background: item.type==="Quiz" ? "rgba(126,181,203,.1)" : "rgba(126,203,161,.1)",
                              color: item.type==="Quiz" ? ACCENT.blue.base : GREEN,
                              border: `1px solid ${item.type==="Quiz" ? ACCENT.blue.border : "rgba(126,203,161,.2)"}`,
                              letterSpacing:".1em", textTransform:"uppercase",
                            }}>{item.type}</span>
                            <span style={{ fontSize:10, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>{item.dur}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <WeekChart/>
                      <div style={{ display:"flex", gap:16, marginTop:12 }}>
                        {[[GREEN,"Today"],[GREEN+" 55","Goal met"],["rgba(255,255,255,.15)","Pending"]].map(([c, l]) => (
                          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
                            <span style={{ fontSize:11, fontWeight:600, color:"rgba(232,230,223,.35)" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
            {/* ══ END LEFT ══ */}

            {/* ══ RIGHT COLUMN ══ */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* QUICK ACTIONS */}
              <div className="db-fade-up d2 db-card">
                <div className="db-card-inner">
                  <SLabel>Quick Actions</SLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {ACTIONS.map((a) => (
                      <button key={a.path} className="db-action-row" onClick={() => navigate(a.path)}>
                        <div style={{
                          width:30, height:30, borderRadius:9, flexShrink:0,
                          background:a.accent.dim, border:`1px solid ${a.accent.border}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .22s",
                        }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:500, color:a.accent.base }}>{a.code}</span>
                        </div>
                        <span style={{ flex:1 }}>{a.label}</span>
                        {a.badge && (
                          <span style={{
                            fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:6,
                            fontFamily:"'JetBrains Mono',monospace",
                            background:"rgba(126,203,161,.09)", border:"1px solid rgba(126,203,161,.2)",
                            color:GREEN, letterSpacing:".08em", textTransform:"uppercase",
                          }}>{a.badge}</span>
                        )}
                        <span style={{ color:"rgba(232,230,223,.2)", fontSize:14 }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI STUDY INSIGHT */}
              <div className="db-fade-up d3 db-card" style={{ background:"rgba(126,203,161,.03)", borderColor:"rgba(126,203,161,.12)" }}>
                <div className="db-card-inner">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <SLabel>AI Study Insight</SLabel>
                    <div className="db-blink" style={{ width:6, height:6, borderRadius:"50%", background:GREEN, marginBottom:16 }}/>
                  </div>

                  <div style={{ padding:"14px 16px", borderRadius:12, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", marginBottom:14 }}>
                    <p style={{ fontSize:13, color:"rgba(232,230,223,.55)", lineHeight:1.75, fontWeight:500 }}>
                      Your weakest area is{" "}
                      <span style={{ color:ACCENT.blue.base, fontWeight:700 }}>Quadratic Equations</span>
                      . Three incomplete attempts. A focused 20-min session could push your score past{" "}
                      <span style={{ color:GREEN, fontWeight:700 }}>70</span>.
                    </p>
                  </div>

                  {/* Score mini-stats */}
                  <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                    {[["Score","62",ACCENT.rose.base],["Target","75",GREEN],["Gap","+13",ACCENT.blue.base]].map(([k,v,c]) => (
                      <div key={k} style={{
                        flex:1, padding:"10px 8px", borderRadius:10,
                        background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)",
                        textAlign:"center",
                      }}>
                        <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:26, fontWeight:500, color:c, lineHeight:1 }}>{v}</div>
                        <div style={{ fontSize:9, color:"rgba(232,230,223,.3)", fontWeight:700, marginTop:3, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>{k}</div>
                      </div>
                    ))}
                  </div>

                  <button className="db-btn-primary" onClick={() => navigate("/student/ai-tutor")}>
                    Ask AI Tutor
                  </button>
                </div>
              </div>

              {/* MENTOR CTA */}
              <div className="db-fade-up d4 db-card" style={{ background:"rgba(203,126,154,.03)", borderColor:"rgba(203,126,154,.12)" }}>
                <div className="db-card-inner">
                  <SLabel accent={ACCENT.rose.base}>Earn as Mentor</SLabel>

                  <p style={{ fontSize:13, color:"rgba(232,230,223,.45)", lineHeight:1.75, marginBottom:16, fontWeight:500 }}>
                    Your History score qualifies you for peer mentoring. Earn{" "}
                    <span style={{ color:ACCENT.rose.base, fontWeight:700 }}>Rs 50–150</span>
                    {" "}per session.
                  </p>

                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => navigate("/student/mentors")} style={{
                      flex:1, padding:"11px",
                      background:`linear-gradient(135deg,${ACCENT.rose.base},${ACCENT.rose.base}cc)`,
                      color:"white", border:"none", borderRadius:12,
                      fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800,
                      letterSpacing:".04em", textTransform:"uppercase",
                      cursor:"pointer", boxShadow:`0 6px 20px ${ACCENT.rose.base}35`,
                      transition:"box-shadow .25s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow=`0 10px 28px ${ACCENT.rose.base}55`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow=`0 6px 20px ${ACCENT.rose.base}35`}
                    >Apply</button>
                    <button className="db-btn-ghost" style={{ width:"auto", padding:"11px 18px" }}
                      onClick={() => showToast("Saved for later", ACCENT.amber.base)}>Later</button>
                  </div>
                </div>
              </div>

              {/* CREDENTIALS */}
              <div className="db-fade-up d5 db-card">
                <div className="db-card-inner">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <SLabel accent={ACCENT.amber.base}>Credentials</SLabel>
                    <button onClick={() => navigate("/student/credentials")} style={{
                      fontSize:12, color:ACCENT.amber.base, fontWeight:700,
                      background:"none", border:"none", cursor:"pointer",
                      fontFamily:"'Syne',sans-serif", marginBottom:16,
                      letterSpacing:".02em",
                    }}>View all →</button>
                  </div>

                  <div style={{ display:"flex", gap:8 }}>
                    {[
                      { label:"Math Jr.", accent:ACCENT.blue,  score:62 },
                      { label:"Science",  accent:ACCENT.green, score:78 },
                      { label:"History",  accent:ACCENT.rose,  score:85 },
                    ].map(c => (
                      <div key={c.label} className="db-cred"
                        onClick={() => navigate("/student/credentials")}
                        onMouseEnter={e => e.currentTarget.style.borderColor=c.accent.border}
                        onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}
                      >
                        <div style={{ position:"relative" }}>
                          <RingProgress value={c.score} size={52} stroke={3} accent={c.accent.base}/>
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:15, fontWeight:500, color:c.accent.base }}>{c.score}</span>
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.35)", textAlign:"center", lineHeight:1.3, letterSpacing:".04em" }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            {/* ══ END RIGHT ══ */}

          </div>{/* end main grid */}

          {/* ── FOOTER ── */}
          <div style={{ marginTop:24, padding:"16px 0", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontWeight:700, fontFamily:"'Syne',sans-serif", letterSpacing:".04em" }}>PathwayAI · Student Dashboard</span>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>
              {clock.toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit", second:"2-digit" })} · Session active
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
