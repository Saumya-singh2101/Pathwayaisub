/**
 * StreaksXP.jsx — PathwayAI
 * Streaks, XP points, levels, badges & leaderboard
 * Design: #0c0c0f base · Syne 800 headings · Instrument Serif italics
 * #7ecba1 green accent · JetBrains Mono for data
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Syne',sans-serif;background:#0c0c0f;color:#e8e6df;overflow-x:hidden}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.25);border-radius:10px}

@keyframes blob-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,28px) scale(.97)}}
@keyframes fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes soft-blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes ping-slow{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}
@keyframes toast-in{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bar-fill{from{width:0}to{width:var(--w)}}
@keyframes xp-pop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes badge-in{from{opacity:0;transform:scale(.7) rotate(-15deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@keyframes streak-pulse{0%,100%{box-shadow:0 0 0 0 rgba(126,203,161,.3)}50%{box-shadow:0 0 0 12px rgba(126,203,161,0)}}
@keyframes flame-flicker{0%,100%{transform:scaleY(1) scaleX(1)}25%{transform:scaleY(1.08) scaleX(.95)}75%{transform:scaleY(.95) scaleX(1.05)}}
@keyframes number-count{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ring-grow{from{stroke-dashoffset:var(--circ)}to{stroke-dashoffset:var(--off)}}
@keyframes shimmer-bar{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes slide-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes level-up-pop{0%{opacity:0;transform:scale(.5)}60%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}

.sx-fade-up{animation:fade-up .65s cubic-bezier(.16,1,.3,1) both}
.sx-fade-in{animation:fade-in .5s ease both}
.sx-blink{animation:soft-blink 2.2s ease-in-out infinite}
.sx-ping{animation:ping-slow 2.5s ease-out infinite}
.sx-streak-pulse{animation:streak-pulse 2.5s ease-out infinite}
.sx-flame{animation:flame-flicker 1.5s ease-in-out infinite}

/* ── Layout ── */
.sx-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.sx-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0;animation:blob-drift 14s ease-in-out infinite}
.sx-pad{position:relative;z-index:1;padding:28px 32px;max-width:1360px;margin:0 auto}

/* ── Card ── */
.sx-card{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  border-radius:20px;position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.sx-card::before{
  content:'';position:absolute;inset:0;border-radius:20px;
  background:linear-gradient(135deg,rgba(126,203,161,.035),transparent 60%);
  pointer-events:none;
}
.sx-card:hover{border-color:rgba(126,203,161,.15);transform:translateY(-2px)}
.sx-card-inner{padding:24px}

/* ── Nav btn ── */
.sx-nav-btn{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.6);
  font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.sx-nav-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#e8e6df}

/* ── Primary btn ── */
.sx-btn-primary{
  padding:13px 0;border-radius:14px;border:none;width:100%;
  background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);
  background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;
  cursor:pointer;transition:all .3s;
}
.sx-btn-primary:hover{background-position:right;transform:translateY(-1px)}

/* ── Toast ── */
.sx-toast{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  padding:13px 20px;border-radius:14px;
  background:rgba(20,20,24,.92);backdrop-filter:blur(24px);
  border:1px solid rgba(126,203,161,.2);box-shadow:0 12px 48px rgba(0,0,0,.5);
  color:#e8e6df;font-size:13px;font-weight:700;
  display:flex;align-items:center;gap:10px;
  animation:toast-in .4s cubic-bezier(.16,1,.3,1) both;
  font-family:'Syne',sans-serif;
}

/* ── Label ── */
.sx-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:14px}

/* ── XP bar ── */
.sx-xp-bar-fill{height:100%;border-radius:999px;animation:bar-fill 1.6s cubic-bezier(.16,1,.3,1) both}

/* ── Badge ── */
.sx-badge{
  display:flex;flex-direction:column;align-items:center;gap:8px;
  padding:18px 12px;border-radius:16px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  cursor:pointer;transition:all .28s;
  position:relative;
}
.sx-badge:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.15)}
.sx-badge.locked{opacity:.38;filter:grayscale(.8)}
.sx-badge.unlocked{animation:badge-in .5s cubic-bezier(.16,1,.3,1) both}

/* ── Leaderboard row ── */
.sx-lb-row{
  display:flex;align-items:center;gap:12px;
  padding:12px 14px;border-radius:12px;
  border:1px solid transparent;
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.sx-lb-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08)}
.sx-lb-row.me{background:rgba(126,203,161,.06);border-color:rgba(126,203,161,.18)}

/* ── Day cell ── */
.sx-day{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:5;
  cursor:default;
}

/* ── Activity ring ── */
.sx-ring{display:block}

/* ── Tab ── */
.sx-tab{
  padding:6px 16px;border-radius:999px;
  font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.03em;
  cursor:pointer;transition:all .22s;border:none;
}

/* ── Level badge ── */
.sx-lvl{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;border-radius:999px;
  font-size:11px;font-weight:800;letter-spacing:.06em;
  font-family:'JetBrains Mono',monospace;
}

/* ── Stat card ── */
.sx-stat{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:18px;position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;padding:20px 22px;
}
.sx-stat:hover{border-color:rgba(126,203,161,.18);transform:translateY(-3px)}
.sx-stat::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.05) 0%,transparent 60%);pointer-events:none}

/* ── Reward card ── */
.sx-reward{
  padding:16px;border-radius:14px;
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  transition:all .22s;cursor:pointer;
}
.sx-reward:hover{background:rgba(255,255,255,.05);transform:translateX(4px)}

/* ── Level-up overlay ── */
.sx-level-up-overlay{
  position:fixed;inset:0;z-index:9998;
  background:rgba(0,0,0,.75);backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;
  animation:fade-in .3s ease;
}
.sx-level-up-box{
  background:rgba(20,22,20,.95);
  border:1px solid rgba(126,203,161,.3);
  border-radius:28px;padding:48px 40px;
  text-align:center;max-width:380px;
  box-shadow:0 0 80px rgba(126,203,161,.15);
  animation:level-up-pop .5s cubic-bezier(.16,1,.3,1) both;
}

/* ── Shimmer ── */
.sx-shimmer{background:rgba(255,255,255,.04);border-radius:10px;position:relative;overflow:hidden}
.sx-shimmer::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(126,203,161,.06),transparent);animation:shimmer-bar 1.8s ease-in-out infinite}

@media(max-width:1100px){.sx-main-grid{grid-template-columns:1fr 1fr !important}}
@media(max-width:740px){.sx-main-grid{grid-template-columns:1fr !important}.sx-pad{padding:18px 16px !important}}
`;

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const GREEN  = "#7ecba1";
const GREEN2 = "#a8e6c4";
const ACCENT = {
  green: { base:"#7ecba1", dim:"rgba(126,203,161,.12)", border:"rgba(126,203,161,.25)" },
  blue:  { base:"#7eb5cb", dim:"rgba(126,181,203,.12)", border:"rgba(126,181,203,.25)" },
  rose:  { base:"#cb7e9a", dim:"rgba(203,126,154,.12)", border:"rgba(203,126,154,.25)" },
  amber: { base:"#cba87e", dim:"rgba(203,168,126,.12)", border:"rgba(203,168,126,.25)" },
};

const LEVEL_THRESHOLDS = [0,100,250,500,900,1400,2100,3000,4200,6000];
const LEVEL_NAMES      = ["Rookie","Explorer","Scholar","Achiever","Champion","Prodigy","Genius","Mastermind","Legend","Grandmaster"];
const LEVEL_COLORS     = [
  ACCENT.blue.base, ACCENT.green.base, ACCENT.amber.base,
  ACCENT.rose.base, ACCENT.blue.base,  GREEN2,
  "#e8c87e", "#c4a8e8", "#e87eb5", "#7ecba1",
];

const WEEKLY_DATA = [
  { d:"MON", xp:85,  sessions:3, done:true  },
  { d:"TUE", xp:140, sessions:5, done:true  },
  { d:"WED", xp:60,  sessions:2, done:true  },
  { d:"THU", xp:110, sessions:4, done:true  },
  { d:"FRI", xp:95,  sessions:3, done:true  },
  { d:"SAT", xp:30,  sessions:1, done:false },
  { d:"SUN", xp:0,   sessions:0, done:false },
];

const BADGES = [
  { id:"b1",  name:"First Step",     desc:"Complete your first session",     icon:"01", accent:ACCENT.green, unlocked:true  },
  { id:"b2",  name:"3-Day Streak",   desc:"Study 3 days in a row",           icon:"03", accent:ACCENT.blue,  unlocked:true  },
  { id:"b3",  name:"Quiz Ace",       desc:"Score 90+ on any quiz",           icon:"QZ", accent:ACCENT.amber, unlocked:true  },
  { id:"b4",  name:"Night Owl",      desc:"Study past 10 PM",                icon:"OW", accent:ACCENT.rose,  unlocked:true  },
  { id:"b5",  name:"7-Day Warrior",  desc:"7 day streak",                    icon:"07", accent:ACCENT.green, unlocked:true  },
  { id:"b6",  name:"Subject Master", desc:"Complete all sessions in one sub", icon:"MA", accent:ACCENT.blue,  unlocked:false },
  { id:"b7",  name:"Mentor",         desc:"Help 5 students",                 icon:"MT", accent:ACCENT.amber, unlocked:false },
  { id:"b8",  name:"30-Day Legend",  desc:"30 day streak",                   icon:"30", accent:ACCENT.rose,  unlocked:false },
  { id:"b9",  name:"Perfect Week",   desc:"7 sessions in 7 days",            icon:"PW", accent:ACCENT.green, unlocked:false },
  { id:"b10", name:"Grandmaster",    desc:"Reach level 10",                  icon:"GM", accent:{base:"#e8c87e",dim:"rgba(232,200,126,.12)",border:"rgba(232,200,126,.25)"}, unlocked:false },
];

const LEADERBOARD = [
  { rank:1,  name:"Riya Sharma",   xp:3820, streak:22, avatar:"RS", accent:ACCENT.amber, isMe:false },
  { rank:2,  name:"Arjun Mehta",   xp:3540, streak:18, avatar:"AM", accent:ACCENT.blue,  isMe:false },
  { rank:3,  name:"Priya Patel",   xp:3210, streak:15, avatar:"PP", accent:ACCENT.rose,  isMe:false },
  { rank:4,  name:"Kavya",         xp:2890, streak:12, avatar:"KV", accent:ACCENT.green, isMe:true  },
  { rank:5,  name:"Dev Gupta",     xp:2650, streak:11, avatar:"DG", accent:ACCENT.amber, isMe:false },
  { rank:6,  name:"Ananya Roy",    xp:2440, streak:9,  avatar:"AR", accent:ACCENT.blue,  isMe:false },
  { rank:7,  name:"Nikhil Joshi",  xp:2210, streak:7,  avatar:"NJ", accent:ACCENT.rose,  isMe:false },
];

const REWARDS = [
  { xp:500,  title:"Free Resume Export",   desc:"Download your AI resume as PDF",  accent:ACCENT.green, claimed:true  },
  { xp:1000, title:"1 Mentor Session",     desc:"30-min session with any mentor",  accent:ACCENT.blue,  claimed:true  },
  { xp:2000, title:"Pro Plan — 1 Week",    desc:"Full access to all AI features",  accent:ACCENT.amber, claimed:false },
  { xp:3000, title:"Certificate of Merit", desc:"Verified digital credential",     accent:ACCENT.rose,  claimed:false },
  { xp:5000, title:"Scholarship Referral", desc:"Priority application access",     accent:ACCENT.green, claimed:false },
];

const DAILY_TASKS = [
  { id:"t1", label:"Complete 1 lesson",     xp:20,  done:true  },
  { id:"t2", label:"Score 70+ on a quiz",   xp:30,  done:true  },
  { id:"t3", label:"Use AI Tutor",          xp:15,  done:false },
  { id:"t4", label:"Solve a doubt",         xp:25,  done:false },
  { id:"t5", label:"Study for 30 minutes",  xp:40,  done:false },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function getLevel(xp) {
  let lvl = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { lvl = i; break; }
  }
  return lvl;
}

function getLevelProgress(xp) {
  const lvl  = getLevel(xp);
  const curr = LEVEL_THRESHOLDS[lvl];
  const next = LEVEL_THRESHOLDS[lvl + 1] || curr + 1000;
  return { lvl, pct: Math.round(((xp - curr) / (next - curr)) * 100), toNext: next - xp };
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SLabel({ children, accent = GREEN }) {
  return <div className="sx-label" style={{ color: accent }}>{children}</div>;
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
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent+"22"} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1.8s cubic-bezier(.16,1,.3,1)", filter:`drop-shadow(0 0 6px ${accent}70)` }}
      />
    </svg>
  );
}

function FlameIcon({ size=22, color=GREEN }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className="sx-flame">
      <path d="M12 2C12 2 8 7 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.6 7.4 12 2ZM8.5 14.5C7.1 13.5 6.5 11.8 7 10.2C7.3 12.1 8.4 13.7 10 14.6C9.5 16.5 8 18 6 18C5 18 4.1 17.7 3.5 17C4.5 16.9 5.5 16.4 6.3 15.5C6.7 15.1 7.1 14.7 7.5 14.4C7.8 14.4 8.2 14.4 8.5 14.5Z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function StreaksXP() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [xp,         setXP]         = useState(2890);
  const [streak,     setStreak]      = useState(12);
  const [tasks,      setTasks]       = useState(DAILY_TASKS);
  const [tab,        setTab]         = useState("overview"); // overview | badges | leaderboard | rewards
  const [toast,      setToast]       = useState(null);
  const [levelUpMsg, setLevelUpMsg]  = useState(null);
  const [xpAnimation,setXPAnimation] = useState(null); // floating +XP

  const prevLevel = useRef(getLevel(xp));

  const showToast = (msg, accent = GREEN) => {
    setToast({ msg, accent });
    setTimeout(() => setToast(null), 3500);
  };

  const addXP = (amount, label) => {
    const newXP    = xp + amount;
    const oldLevel = getLevel(xp);
    const newLevel = getLevel(newXP);
    setXP(newXP);
    setXPAnimation({ amount, label });
    setTimeout(() => setXPAnimation(null), 2000);
    if (newLevel > oldLevel) {
      setLevelUpMsg({ level:newLevel, name:LEVEL_NAMES[newLevel], color:LEVEL_COLORS[newLevel] });
    } else {
      showToast(`+${amount} XP — ${label}`);
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.done) return t;
      addXP(t.xp, t.label);
      return { ...t, done:true };
    }));
  };

  const { lvl, pct, toNext } = getLevelProgress(xp);
  const lvlColor = LEVEL_COLORS[lvl];
  const doneTasks = tasks.filter(t => t.done).length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Level-up overlay */}
      {levelUpMsg && (
        <div className="sx-level-up-overlay" onClick={() => setLevelUpMsg(null)}>
          <div className="sx-level-up-box">
            <div style={{ fontSize:56, marginBottom:16 }}>
              <FlameIcon size={56} color={levelUpMsg.color}/>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:"rgba(232,230,223,.4)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:8 }}>Level Up!</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:38, fontWeight:800, color:"#f0ede6", letterSpacing:"-.04em", lineHeight:1.1, marginBottom:4 }}>
              Level <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", color:levelUpMsg.color }}>{levelUpMsg.level}</span>
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:levelUpMsg.color, marginBottom:20 }}>{levelUpMsg.name}</div>
            <p style={{ fontSize:13, color:"rgba(232,230,223,.4)", lineHeight:1.65, marginBottom:24 }}>
              You have reached a new level. Keep going — the next milestone is within reach.
            </p>
            <button className="sx-btn-primary" onClick={() => setLevelUpMsg(null)}>Continue Learning →</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="sx-toast">
          <div style={{ width:8, height:8, borderRadius:"50%", background:toast.accent, flexShrink:0, boxShadow:`0 0 8px ${toast.accent}` }}/>
          {toast.msg}
        </div>
      )}

      {/* Floating XP */}
      {xpAnimation && (
        <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)", zIndex:9997, pointerEvents:"none", animation:"level-up-pop .5s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:48, fontWeight:500, color:GREEN, filter:`drop-shadow(0 0 20px ${GREEN}80)`, textAlign:"center" }}>
            +{xpAnimation.amount}
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:GREEN, letterSpacing:".12em", textAlign:"center", textTransform:"uppercase", marginTop:4 }}>XP</div>
        </div>
      )}

      <div className="sx-root">
        {/* Blobs */}
        <div className="sx-blob" style={{ width:560, height:560, background:"rgba(126,203,161,.05)", top:-160, right:-140 }}/>
        <div className="sx-blob" style={{ width:400, height:400, background:"rgba(80,100,200,.03)", bottom:160, left:-100, animationDelay:"4s", animationDuration:"18s" }}/>
        <div className="sx-blob" style={{ width:280, height:280, background:"rgba(203,168,126,.025)", top:"45%", left:"35%", animationDelay:"8s", animationDuration:"22s" }}/>

        <div className="sx-pad">

          {/* Top nav */}
          <div className="sx-fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button className="sx-nav-btn" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
            </div>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(126,203,161,.1)", border:"1px solid rgba(126,203,161,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <LogoMark/>
            </div>
          </div>

          {/* Hero */}
          <div className="sx-fade-up" style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ position:"relative", width:8, height:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
                <div className="sx-ping" style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>Your Progress</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(32px,3.5vw,48px)", fontWeight:800, lineHeight:1.0, letterSpacing:"-.04em", color:"#f0ede6", margin:0 }}>
              Streaks &{" "}
              <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:GREEN }}>
                XP.
              </span>
            </h1>
          </div>

          {/* ════ HERO STAT CARDS ════ */}
          <div className="sx-fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16, animationDelay:".06s" }}>

            {/* Streak */}
            <div className="sx-stat sx-streak-pulse" style={{ borderColor:"rgba(126,203,161,.2)" }}>
              <div style={{ position:"absolute", top:0, left:18, right:18, height:2, borderRadius:"0 0 4px 4px", background:GREEN, opacity:.55 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <FlameIcon size={20} color={GREEN} />
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".04em" }}>+2 this week</span>
              </div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:44, fontStyle:"italic", fontWeight:500, color:"#f0ede6", lineHeight:1, marginBottom:3, filter:`drop-shadow(0 0 16px ${GREEN}40)` }}>{streak}</div>
              <div style={{ fontSize:11, fontWeight:700, color:GREEN, letterSpacing:".06em", textTransform:"uppercase" }}>Day Streak</div>
            </div>

            {/* XP */}
            <div className="sx-stat">
              <div style={{ position:"absolute", top:0, left:18, right:18, height:2, borderRadius:"0 0 4px 4px", background:ACCENT.blue.base, opacity:.55 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:ACCENT.blue.dim, border:`1px solid ${ACCENT.blue.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, color:ACCENT.blue.base }}>XP</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace" }}>+520 today</span>
              </div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:44, fontStyle:"italic", fontWeight:500, color:"#f0ede6", lineHeight:1, marginBottom:3 }}>{xp.toLocaleString()}</div>
              <div style={{ fontSize:11, fontWeight:700, color:ACCENT.blue.base, letterSpacing:".06em", textTransform:"uppercase" }}>Total XP</div>
            </div>

            {/* Level */}
            <div className="sx-stat">
              <div style={{ position:"absolute", top:0, left:18, right:18, height:2, borderRadius:"0 0 4px 4px", background:lvlColor, opacity:.55 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${lvlColor}18`, border:`1px solid ${lvlColor}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, color:lvlColor }}>LV</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace" }}>{toNext} to next</span>
              </div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:44, fontStyle:"italic", fontWeight:500, color:lvlColor, lineHeight:1, marginBottom:3, filter:`drop-shadow(0 0 12px ${lvlColor}40)` }}>{lvl}</div>
              <div style={{ fontSize:11, fontWeight:700, color:lvlColor, letterSpacing:".06em", textTransform:"uppercase" }}>{LEVEL_NAMES[lvl]}</div>
            </div>

            {/* Badges */}
            <div className="sx-stat">
              <div style={{ position:"absolute", top:0, left:18, right:18, height:2, borderRadius:"0 0 4px 4px", background:ACCENT.amber.base, opacity:.55 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:ACCENT.amber.dim, border:`1px solid ${ACCENT.amber.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, color:ACCENT.amber.base }}>BD</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace" }}>{BADGES.filter(b=>!b.unlocked).length} locked</span>
              </div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:44, fontStyle:"italic", fontWeight:500, color:ACCENT.amber.base, lineHeight:1, marginBottom:3 }}>{BADGES.filter(b=>b.unlocked).length}</div>
              <div style={{ fontSize:11, fontWeight:700, color:ACCENT.amber.base, letterSpacing:".06em", textTransform:"uppercase" }}>Badges Earned</div>
            </div>
          </div>

          {/* XP level progress bar */}
          <div className="sx-fade-up sx-card" style={{ marginBottom:20, padding:"16px 24px", animationDelay:".08s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div className="sx-lvl" style={{ background:`${lvlColor}15`, border:`1px solid ${lvlColor}40`, color:lvlColor }}>
                  LV {lvl} · {LEVEL_NAMES[lvl]}
                </div>
                <span style={{ fontSize:12, color:"rgba(232,230,223,.35)", fontWeight:600 }}>{xp.toLocaleString()} XP</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, color:"rgba(232,230,223,.3)", fontWeight:600 }}>{toNext} XP to</span>
                <div className="sx-lvl" style={{ background:`${LEVEL_COLORS[lvl+1] || GREEN}15`, border:`1px solid ${LEVEL_COLORS[lvl+1] || GREEN}40`, color:LEVEL_COLORS[lvl+1] || GREEN }}>
                  LV {lvl+1} · {LEVEL_NAMES[lvl+1] || "Max"}
                </div>
              </div>
            </div>
            <div style={{ height:8, borderRadius:999, background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
              <div className="sx-xp-bar-fill" style={{
                "--w":`${pct}%`, width:`${pct}%`,
                background:`linear-gradient(90deg,${lvlColor}80,${lvlColor},${GREEN2})`,
                boxShadow:`0 0 14px ${lvlColor}60`,
              }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:500, color:lvlColor }}>{pct}%</span>
            </div>
          </div>

          {/* ════ TABS ════ */}
          <div className="sx-fade-up" style={{ display:"flex", gap:4, marginBottom:20, padding:4, borderRadius:999, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)", width:"fit-content", animationDelay:".1s" }}>
            {[["overview","Overview"],["badges","Badges"],["leaderboard","Leaderboard"],["rewards","Rewards"]].map(([t,l]) => (
              <button key={t} className="sx-tab" onClick={() => setTab(t)} style={{
                background: tab===t ? "rgba(126,203,161,.12)" : "transparent",
                color:      tab===t ? GREEN : "rgba(232,230,223,.35)",
                border:     tab===t ? "1px solid rgba(126,203,161,.2)" : "1px solid transparent",
              }}>{l}</button>
            ))}
          </div>

          {/* ════ OVERVIEW TAB ════ */}
          {tab === "overview" && (
            <div className="sx-main-grid" style={{ display:"grid", gridTemplateColumns:"minmax(0,1.5fr) minmax(0,1fr)", gap:20, animationDelay:".12s" }}>

              {/* LEFT */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Weekly heatmap */}
                <div className="sx-fade-up sx-card" style={{ animationDelay:".12s" }}>
                  <div className="sx-card-inner">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <SLabel>This Week</SLabel>
                      <span style={{ fontSize:12, fontWeight:700, color:GREEN, marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>
                        {WEEKLY_DATA.reduce((a,d)=>a+d.xp,0)} XP total
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:80 }}>
                      {WEEKLY_DATA.map((d, i) => {
                        const maxXP = Math.max(...WEEKLY_DATA.map(w=>w.xp));
                        const pct   = maxXP > 0 ? d.xp / maxXP : 0;
                        const isToday = i === 4;
                        return (
                          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                            {d.xp > 0 && (
                              <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", fontWeight:500, color: isToday ? GREEN : "rgba(232,230,223,.25)" }}>{d.xp}</span>
                            )}
                            <div style={{ width:"100%", height:60, borderRadius:8, overflow:"hidden", background:"rgba(255,255,255,.05)", position:"relative" }}>
                              <div style={{
                                position:"absolute", bottom:0, left:0, right:0,
                                height:`${pct*100}%`,
                                background: isToday ? `linear-gradient(180deg,${GREEN2},${GREEN})` : d.done ? "rgba(126,203,161,.45)" : "rgba(255,255,255,.06)",
                                borderRadius:"6px 6px 0 0",
                                boxShadow: isToday ? `0 -4px 12px ${GREEN}50` : "none",
                                transition:"height 1.2s cubic-bezier(.16,1,.3,1)",
                              }}/>
                            </div>
                            <span style={{ fontSize:9, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".04em", color: isToday ? GREEN : d.done ? "rgba(126,203,161,.5)" : "rgba(232,230,223,.2)" }}>{d.d}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Daily tasks */}
                <div className="sx-fade-up sx-card" style={{ animationDelay:".16s" }}>
                  <div className="sx-card-inner">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <SLabel>Daily Tasks</SLabel>
                      <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.3)", marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>
                        {doneTasks} / {tasks.length} done
                      </span>
                    </div>

                    {/* Progress strip */}
                    <div style={{ height:4, borderRadius:999, background:"rgba(255,255,255,.07)", overflow:"hidden", marginBottom:16 }}>
                      <div style={{ height:"100%", width:`${(doneTasks/tasks.length)*100}%`, background:`linear-gradient(90deg,${GREEN},${GREEN2})`, borderRadius:999, boxShadow:`0 0 8px ${GREEN}50`, transition:"width .6s cubic-bezier(.16,1,.3,1)" }}/>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {tasks.map((t) => (
                        <div key={t.id}
                          onClick={() => toggleTask(t.id)}
                          style={{
                            display:"flex", alignItems:"center", gap:12,
                            padding:"11px 14px", borderRadius:12, cursor: t.done ? "default" : "pointer",
                            border:`1px solid ${t.done ? "rgba(126,203,161,.15)" : "rgba(255,255,255,.07)"}`,
                            background: t.done ? "rgba(126,203,161,.05)" : "rgba(255,255,255,.025)",
                            opacity: t.done ? 0.55 : 1,
                            transition:"all .22s",
                          }}
                          onMouseEnter={e => { if (!t.done) e.currentTarget.style.background="rgba(255,255,255,.05)"; }}
                          onMouseLeave={e => { if (!t.done) e.currentTarget.style.background="rgba(255,255,255,.025)"; }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width:18, height:18, borderRadius:6, flexShrink:0,
                            border:`1.5px solid ${t.done ? GREEN : "rgba(255,255,255,.15)"}`,
                            background: t.done ? "rgba(126,203,161,.15)" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all .2s",
                          }}>
                            {t.done && <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span style={{ flex:1, fontSize:13, fontWeight:600, color: t.done ? "rgba(232,230,223,.45)" : "#e8e6df", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
                          <div style={{
                            padding:"3px 10px", borderRadius:8,
                            background: t.done ? "rgba(126,203,161,.08)" : ACCENT.green.dim,
                            border:`1px solid ${t.done ? "rgba(126,203,161,.12)" : ACCENT.green.border}`,
                          }}>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color: t.done ? "rgba(126,203,161,.5)" : GREEN, letterSpacing:".06em" }}>+{t.xp} XP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Streak calendar — last 30 days */}
                <div className="sx-fade-up sx-card" style={{ animationDelay:".14s" }}>
                  <div className="sx-card-inner">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <SLabel>Streak Calendar</SLabel>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
                        <FlameIcon size={14} color={GREEN}/>
                        <span style={{ fontSize:12, fontWeight:700, color:GREEN }}>{streak} days</span>
                      </div>
                    </div>
                    {/* 5x6 grid = 30 days */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
                      {Array.from({ length:30 }, (_,i) => {
                        const daysAgo = 29 - i;
                        const active  = daysAgo < streak;
                        const today   = daysAgo === 0;
                        const color   = today ? GREEN : active ? `${GREEN}70` : "rgba(255,255,255,.06)";
                        return (
                          <div key={i} style={{
                            aspectRatio:"1", borderRadius:6,
                            background: color,
                            boxShadow: today ? `0 0 8px ${GREEN}60` : "none",
                            position:"relative",
                          }}>
                            {today && <div style={{ position:"absolute", inset:-2, borderRadius:8, border:`1.5px solid ${GREEN}60` }}/>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, fontSize:10, color:"rgba(232,230,223,.25)", fontFamily:"'JetBrains Mono',monospace" }}>
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Quick earn XP */}
                <div className="sx-fade-up sx-card" style={{ animationDelay:".18s", background:"rgba(126,203,161,.02)", borderColor:"rgba(126,203,161,.1)" }}>
                  <div className="sx-card-inner">
                    <SLabel>Earn XP Now</SLabel>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[
                        { label:"Take a quiz",       xp:30, path:"/student/quiz",       accent:ACCENT.blue  },
                        { label:"Ask AI Tutor",       xp:15, path:"/student/ai-tutor",   accent:ACCENT.green },
                        { label:"Solve a doubt",      xp:25, path:"/student/ai-doubt",   accent:ACCENT.amber },
                        { label:"Start a lesson",     xp:20, path:"/student/lessons",    accent:ACCENT.rose  },
                        { label:"Mock interview",     xp:50, path:"/student/interview",  accent:ACCENT.blue  },
                      ].map((a, i) => (
                        <button key={i} onClick={() => navigate(a.path)} style={{
                          display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                          borderRadius:12, cursor:"pointer",
                          border:"1px solid rgba(255,255,255,.07)",
                          background:"rgba(255,255,255,.025)",
                          fontFamily:"'Syne',sans-serif", color:"rgba(232,230,223,.65)",
                          fontSize:13, fontWeight:600, textAlign:"left",
                          transition:"all .22s", width:"100%",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color="#e8e6df"; e.currentTarget.style.transform="translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.025)"; e.currentTarget.style.color="rgba(232,230,223,.65)"; e.currentTarget.style.transform="none"; }}
                        >
                          <div style={{ width:26, height:26, borderRadius:7, background:a.accent.dim, border:`1px solid ${a.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:a.accent.base }}/>
                          </div>
                          <span style={{ flex:1 }}>{a.label}</span>
                          <div style={{ padding:"3px 8px", borderRadius:7, background:a.accent.dim, border:`1px solid ${a.accent.border}` }}>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:a.accent.base }}>+{a.xp} XP</span>
                          </div>
                          <span style={{ color:"rgba(232,230,223,.2)", fontSize:12 }}>›</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ BADGES TAB ════ */}
          {tab === "badges" && (
            <div className="sx-fade-in">
              <div style={{ marginBottom:16, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"rgba(232,230,223,.35)", fontWeight:600 }}>
                  {BADGES.filter(b=>b.unlocked).length} of {BADGES.length} badges earned
                </span>
                <div style={{ height:4, flex:1, minWidth:100, maxWidth:200, borderRadius:999, background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(BADGES.filter(b=>b.unlocked).length/BADGES.length)*100}%`, background:`linear-gradient(90deg,${ACCENT.amber.base},${GREEN})`, borderRadius:999, transition:"width 1s" }}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12 }}>
                {BADGES.map((b, i) => (
                  <div key={b.id} className={`sx-badge ${b.unlocked ? "unlocked" : "locked"}`}
                    style={{ animationDelay:`${i*0.05}s`,
                      borderColor: b.unlocked ? b.accent.border : "rgba(255,255,255,.07)",
                      background:  b.unlocked ? b.accent.dim : "rgba(255,255,255,.025)",
                    }}
                    onClick={() => b.unlocked && showToast(`${b.name} — ${b.desc}`, b.accent.base)}
                  >
                    {/* Shine on unlocked */}
                    {b.unlocked && (
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:40, background:`linear-gradient(180deg,${b.accent.base}20,transparent)`, borderRadius:"20px 20px 0 0", pointerEvents:"none" }}/>
                    )}
                    <div style={{ width:44, height:44, borderRadius:14, background: b.unlocked ? `${b.accent.base}20` : "rgba(255,255,255,.04)", border:`1.5px solid ${b.unlocked ? b.accent.border : "rgba(255,255,255,.06)"}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color: b.unlocked ? b.accent.base : "rgba(255,255,255,.2)" }}>{b.icon}</span>
                      {!b.unlocked && (
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, background:"rgba(12,12,15,.6)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color: b.unlocked ? "#f0ede6" : "rgba(232,230,223,.25)", textAlign:"center", lineHeight:1.3 }}>{b.name}</div>
                    <div style={{ fontSize:10, color: b.unlocked ? "rgba(232,230,223,.35)" : "rgba(232,230,223,.15)", textAlign:"center", lineHeight:1.5 }}>{b.desc}</div>
                    {b.unlocked && (
                      <div style={{ width:6, height:6, borderRadius:"50%", background:b.accent.base, boxShadow:`0 0 6px ${b.accent.base}` }}/>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ LEADERBOARD TAB ════ */}
          {tab === "leaderboard" && (
            <div className="sx-fade-in">
              <div className="sx-card">
                <div className="sx-card-inner">
                  <SLabel>Class Leaderboard</SLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {LEADERBOARD.map((p, i) => (
                      <div key={i} className={`sx-lb-row ${p.isMe ? "me" : ""}`}>
                        {/* Rank */}
                        <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
                          {p.rank <= 3 ? (
                            <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, fontWeight:500, color:["#e8c87e","rgba(200,200,220,.7)","#c4956a"][p.rank-1], filter:`drop-shadow(0 0 4px ${["#e8c87e80","rgba(200,200,220,.3)","#c4956a80"][p.rank-1]})` }}>{p.rank}</span>
                          ) : (
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:500, color:"rgba(232,230,223,.25)" }}>{p.rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div style={{ width:36, height:36, borderRadius:10, background:p.accent.dim, border:`1px solid ${p.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:p.accent.base }}>{p.avatar}</span>
                          {p.isMe && <div style={{ position:"absolute", inset:-2, borderRadius:12, border:`1.5px solid ${GREEN}60` }}/>}
                        </div>

                        {/* Name */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color: p.isMe ? GREEN : "#f0ede6", display:"flex", alignItems:"center", gap:6 }}>
                            {p.name}
                            {p.isMe && <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:GREEN, letterSpacing:".08em" }}>· YOU</span>}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                            <FlameIcon size={10} color={GREEN}/>
                            <span style={{ fontSize:10, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace" }}>{p.streak}d streak</span>
                          </div>
                        </div>

                        {/* XP */}
                        <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:24, fontWeight:500, color: p.isMe ? GREEN : "rgba(232,230,223,.55)", minWidth:60, textAlign:"right", filter: p.isMe ? `drop-shadow(0 0 6px ${GREEN}60)` : "none" }}>
                          {p.xp.toLocaleString()}
                        </span>
                        <span style={{ fontSize:10, color:"rgba(232,230,223,.25)", fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ REWARDS TAB ════ */}
          {tab === "rewards" && (
            <div className="sx-fade-in">
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {REWARDS.map((r, i) => {
                  const unlocked = xp >= r.xp;
                  return (
                    <div key={i} className="sx-reward"
                      style={{ opacity: r.claimed ? 0.5 : 1, borderColor: unlocked ? r.accent.border : "rgba(255,255,255,.07)", background: unlocked ? r.accent.dim : "rgba(255,255,255,.025)" }}
                      onClick={() => unlocked && !r.claimed && showToast(`Claimed: ${r.title}!`, r.accent.base)}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        {/* XP needed */}
                        <div style={{ width:60, textAlign:"center", flexShrink:0 }}>
                          <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:28, fontWeight:500, color: unlocked ? r.accent.base : "rgba(232,230,223,.2)", lineHeight:1, filter: unlocked ? `drop-shadow(0 0 8px ${r.accent.base}60)` : "none" }}>
                            {(r.xp/1000).toFixed(r.xp >= 1000 ? 0 : 1)}k
                          </div>
                          <div style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:"rgba(232,230,223,.2)", letterSpacing:".1em" }}>XP</div>
                        </div>

                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:700, color: unlocked ? "#f0ede6" : "rgba(232,230,223,.35)", marginBottom:3 }}>{r.title}</div>
                          <div style={{ fontSize:12, color:"rgba(232,230,223,.3)" }}>{r.desc}</div>
                        </div>

                        {/* Status */}
                        <div style={{
                          padding:"6px 14px", borderRadius:8, flexShrink:0,
                          background: r.claimed ? "rgba(126,203,161,.08)" : unlocked ? r.accent.dim : "rgba(255,255,255,.04)",
                          border:`1px solid ${r.claimed ? "rgba(126,203,161,.15)" : unlocked ? r.accent.border : "rgba(255,255,255,.07)"}`,
                        }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:".06em", color: r.claimed ? GREEN : unlocked ? r.accent.base : "rgba(232,230,223,.2)" }}>
                            {r.claimed ? "CLAIMED" : unlocked ? "CLAIM →" : `${(r.xp - xp).toLocaleString()} XP left`}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {!r.claimed && (
                        <div style={{ marginTop:10, height:3, borderRadius:999, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${Math.min((xp/r.xp)*100,100)}%`, background:`linear-gradient(90deg,${r.accent.base}60,${r.accent.base})`, borderRadius:999, transition:"width 1.2s cubic-bezier(.16,1,.3,1)" }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop:32, padding:"16px 0", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontWeight:700, letterSpacing:".04em" }}>PathwayAI · Streaks & XP</span>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>Gamified learning · Stay consistent</span>
          </div>
        </div>
      </div>
    </>
  );
}
