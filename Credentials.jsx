/**
 * Credentials.jsx — PathwayAI Open Badge Credentials
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const GREEN = "#7ecba1";
const GREEN2 = "#a8e6c4";

const ALL_BADGES = [
  { id:"math-bronze",   subject:"Mathematics", icon:"∑",   tier:"Bronze", color:"#b8864a", glow:"rgba(184,134,74,.35)", gradient:"linear-gradient(135deg,#92400e,#b45309,#CD7F32)", earned:true,  earnedDate:"12 Jan 2026", score:74, desc:"Foundational understanding of algebraic concepts and equations.", skills:["Algebra","Linear Equations","Basic Geometry"], shareUrl:"https://pathwayai.in/verify/MATH-BRZ-2026-001" },
  { id:"science-bronze",subject:"Science",     icon:"⚗",   tier:"Bronze", color:"#b8864a", glow:"rgba(184,134,74,.35)", gradient:"linear-gradient(135deg,#92400e,#b45309,#CD7F32)", earned:true,  earnedDate:"18 Jan 2026", score:78, desc:"Solid grasp of fundamental physics and chemistry concepts.", skills:["Newton's Laws","Chemical Reactions","Matter & Energy"], shareUrl:"https://pathwayai.in/verify/SCI-BRZ-2026-003" },
  { id:"math-silver",   subject:"Mathematics", icon:"∑",   tier:"Silver", color:"#94a3b8", glow:"rgba(148,163,184,.35)", gradient:"linear-gradient(135deg,#475569,#64748b,#94A3B8)", earned:true,  earnedDate:"25 Jan 2026", score:87, desc:"Advanced proficiency in quadratic equations, trigonometry and statistics.", skills:["Quadratic Equations","Trigonometry","Statistics","Coordinate Geometry"], shareUrl:"https://pathwayai.in/verify/MATH-SLV-2026-007" },
  { id:"coding-bronze", subject:"Coding",      icon:"</>", tier:"Bronze", color:"#b8864a", glow:"rgba(184,134,74,.35)", gradient:"linear-gradient(135deg,#92400e,#b45309,#CD7F32)", earned:true,  earnedDate:"02 Feb 2026", score:81, desc:"Demonstrated competency in Python basics, arrays, and sorting algorithms.", skills:["Python Basics","Arrays","Sorting Algorithms","OOP Concepts"], shareUrl:"https://pathwayai.in/verify/CODE-BRZ-2026-012" },
  { id:"math-gold",     subject:"Mathematics", icon:"∑",   tier:"Gold",   color:"#cba87e", glow:"rgba(203,168,126,.4)", gradient:"linear-gradient(135deg,#92400e,#d97706,#F59E0B,#fbbf24)", earned:false, progress:72, required:90, desc:"Master-level mathematics — calculus, probability, advanced geometry.", skills:["Calculus","Probability","Advanced Geometry","Number Theory"], unlockHint:"Score 90%+ on 3 more Math quizzes" },
  { id:"science-silver",subject:"Science",     icon:"⚗",   tier:"Silver", color:"#94a3b8", glow:"rgba(148,163,184,.3)", gradient:"linear-gradient(135deg,#475569,#64748b,#94A3B8)", earned:false, progress:45, required:85, desc:"Advanced science — electromagnetism, organic chemistry, cell biology.", skills:["Electromagnetism","Organic Chemistry","Cell Biology"], unlockHint:"Complete 5 more Science quizzes with 80%+" },
  { id:"history-bronze",subject:"History",     icon:"◈",   tier:"Bronze", color:"#b8864a", glow:"rgba(184,134,74,.3)",  gradient:"linear-gradient(135deg,#92400e,#b45309,#CD7F32)", earned:false, progress:30, required:70, desc:"Foundation in ancient and modern Indian history.", skills:["Ancient India","Freedom Movement","Modern History"], unlockHint:"Score 70%+ on 2 History quizzes" },
  { id:"mentor-star",   subject:"Peer Mentor", icon:"◆",   tier:"Gold",   color:"#cba87e", glow:"rgba(203,168,126,.4)", gradient:"linear-gradient(135deg,#78350f,#d97706,#fbbf24)", earned:false, progress:0,  required:100, desc:"Recognised for exceptional peer mentoring and teaching impact.", skills:["Teaching","Mentorship","Communication"], unlockHint:"Complete 10 mentor sessions with 4.5+ rating" },
];

const earned = ALL_BADGES.filter(b => b.earned);
const locked = ALL_BADGES.filter(b => !b.earned);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@keyframes fade-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes scale-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes float-badge{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-8px) rotate(1deg)}}
@keyframes blob-drift{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-18px)scale(1.04)}66%{transform:translate(-18px,22px)scale(.97)}}
@keyframes progress-fill{from{width:0}to{width:var(--w)}}
@keyframes ping{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}

.fu{animation:fade-up .55s cubic-bezier(.16,1,.3,1) both}
.si{animation:scale-in .45s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
.d4{animation-delay:.24s}.d5{animation-delay:.3s}.d6{animation-delay:.36s}
.fl{animation:float-badge 5s ease-in-out infinite}

/* ── Root ── */
.cr-root{min-height:100vh;background:#0c0c0f;position:relative;overflow-x:hidden}
.cr-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}

/* ── Topbar ── */
.cr-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(12,12,15,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:14px 28px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;
}
.cr-topbar-title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:#f0ede6;flex:1}

/* ── Btns ── */
.cr-btn-ghost{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.cr-btn-ghost:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.cr-btn-primary{
  padding:11px 22px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${GREEN},${GREEN2},${GREEN});background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.cr-btn-primary:hover{background-position:right;transform:translateY(-1px)}

/* ── Card ── */
.cr-card{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:20px;
  position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.cr-card:hover{border-color:rgba(126,203,161,.14);transform:translateY(-3px)}

/* ── Badge hex ── */
.cr-hex{
  clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:transform .35s cubic-bezier(.16,1,.3,1);cursor:pointer;
}
.cr-hex:hover{transform:scale(1.08) rotate(3deg)}

/* ── Skill pill ── */
.cr-skill{
  padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
  color:rgba(232,230,223,.45);
}

/* ── Tab ── */
.cr-tab{
  padding:8px 18px;border-radius:999px;border:1px solid transparent;
  font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
  cursor:pointer;transition:all .2s;background:transparent;color:rgba(232,230,223,.3);
}
.cr-tab.active{background:rgba(126,203,161,.1);border-color:rgba(126,203,161,.25);color:${GREEN}}
.cr-tab:not(.active):hover{color:rgba(232,230,223,.65)}

/* ── Modal ── */
.cr-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.cr-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(10px)}
.cr-modal{
  position:relative;z-index:1;width:100%;max-width:480px;border-radius:24px;overflow:hidden;
  animation:scale-in .4s cubic-bezier(.16,1,.3,1) both;
  background:#0f1014;border:1px solid rgba(255,255,255,.1);
  box-shadow:0 32px 80px rgba(0,0,0,.7);
}

/* ── Credential preview card ── */
.cr-preview{
  padding:32px;
  background:linear-gradient(145deg,#0a1628,#122040,#0a1628);
  position:relative;overflow:hidden;
}

/* ── Progress bar ── */
.cr-prog-fill{height:100%;border-radius:999px;animation:progress-fill 1.2s cubic-bezier(.16,1,.3,1) both}

/* ── Input ── */
.cr-input{
  width:100%;padding:11px 14px;border-radius:11px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:#e8e6df;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  outline:none;transition:border-color .2s;
}
.cr-input:focus{border-color:rgba(126,203,161,.3)}
.cr-input::placeholder{color:rgba(232,230,223,.2)}

/* ── Toast ── */
.cr-toast{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
  padding:11px 22px;border-radius:12px;
  background:rgba(126,203,161,.15);border:1px solid rgba(126,203,161,.3);
  color:${GREEN};font-size:13px;font-weight:800;
  animation:fade-up .3s ease both;z-index:200;
  font-family:'Syne',sans-serif;white-space:nowrap;
}

/* QR mock */
.cr-qr{width:64px;height:64px;border-radius:8px;background:white;display:grid;grid-template-columns:repeat(7,1fr);gap:1.5px;padding:7px}
.cr-qr-cell{border-radius:1px}

.cr-content{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:32px 28px}
`;

function QRMock({ seed }) {
  const pat = Array.from({ length:49 }, (_,i) => ((seed*(i+1)*7)%3)!==0);
  return (
    <div className="cr-qr">
      {pat.map((f,i) => <div key={i} className="cr-qr-cell" style={{ background:f?"#0a1628":"transparent" }}/>)}
    </div>
  );
}

function ShareModal({ badge, user, onClose }) {
  const [toast, setToast] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(badge.shareUrl).catch(()=>{});
    setToast(true); setTimeout(()=>setToast(false),2500);
  };
  return (
    <>
      {toast && <div className="cr-toast">Link copied to clipboard</div>}
      <div className="cr-overlay">
        <div className="cr-backdrop" onClick={onClose}/>
        <div className="cr-modal">
          {/* Credential card preview */}
          <div className="cr-preview">
            <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(126,203,161,.05) 1px,transparent 1px)",backgroundSize:"20px 20px" }}/>
            <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${badge.glow} 0%,transparent 70%)` }}/>

            {/* Logo */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:24,position:"relative" }}>
              <div style={{ width:30,height:30,borderRadius:9,background:"rgba(126,203,161,.15)",border:"1px solid rgba(126,203,161,.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 11H2L8 2Z" fill={GREEN} opacity=".85"/><circle cx="8" cy="11" r="2.5" fill={GREEN}/></svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"white" }}>PathwayAI</div>
                <div style={{ fontSize:9,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace" }}>Open Badge Credential</div>
              </div>
              <div style={{ marginLeft:"auto",padding:"3px 10px",borderRadius:20,background:"rgba(126,203,161,.15)",border:"1px solid rgba(126,203,161,.3)",fontSize:9,color:GREEN,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em" }}>Verified</div>
            </div>

            {/* Badge + info */}
            <div style={{ display:"flex",gap:18,alignItems:"center",position:"relative" }}>
              <div className="cr-hex fl" style={{ width:76,height:76,background:badge.gradient }}>
                <span style={{ fontSize:24,color:"white",fontWeight:800,filter:"drop-shadow(0 2px 8px rgba(0,0,0,.5))" }}>{badge.icon}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4,fontFamily:"'JetBrains Mono',monospace" }}>{badge.tier} Badge</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"white",marginBottom:4 }}>{badge.subject}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,.55)",lineHeight:1.55 }}>{badge.desc}</div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginTop:18,position:"relative" }}>
              <div style={{ fontSize:9,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace" }}>Verified Skills</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {badge.skills.map(s => (
                  <span key={s} style={{ padding:"3px 10px",borderRadius:20,background:"rgba(126,203,161,.12)",border:"1px solid rgba(126,203,161,.25)",fontSize:10,fontWeight:700,color:GREEN }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop:22,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-end",position:"relative" }}>
              <div>
                <div style={{ fontSize:9,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4,fontFamily:"'JetBrains Mono',monospace" }}>Awarded To</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:"white" }}>{user?.name || "Student"}</div>
                <div style={{ fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2,fontFamily:"'JetBrains Mono',monospace" }}>Earned {badge.earnedDate} · Score {badge.score}%</div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <QRMock seed={badge.id.length*17}/>
                <div style={{ fontSize:8,color:"rgba(255,255,255,.25)",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em" }}>Scan to Verify</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding:20,display:"flex",flexDirection:"column",gap:10 }}>
            <p style={{ fontSize:12,color:"rgba(232,230,223,.3)",textAlign:"center",fontWeight:500 }}>Share this credential with employers</p>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={copyLink} style={{ flex:1,padding:"11px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"rgba(232,230,223,.65)",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>Copy Link</button>
              <button style={{ flex:1,padding:"11px",borderRadius:11,border:"none",background:"rgba(37,211,102,.12)",border:"1px solid rgba(37,211,102,.25)",color:"#25D366",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>WhatsApp</button>
              <button style={{ flex:1,padding:"11px",borderRadius:11,border:"none",background:"rgba(0,119,181,.12)",border:"1px solid rgba(0,119,181,.25)",color:"#0077B5",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>LinkedIn</button>
            </div>
            <button onClick={onClose} style={{ padding:"10px",borderRadius:11,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"rgba(232,230,223,.3)",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

function EarnedBadgeCard({ badge, index, onShare }) {
  return (
    <div className={`cr-card fu d${(index%6)+1}`} style={{ padding:24,cursor:"pointer" }} onClick={() => onShare(badge)}>
      <div style={{ display:"flex",gap:16,alignItems:"flex-start",marginBottom:16 }}>
        <div className="cr-hex fl" style={{ width:80,height:80,background:badge.gradient }}>
          <span style={{ fontSize:26,color:"white",fontWeight:800,filter:"drop-shadow(0 2px 8px rgba(0,0,0,.5))" }}>{badge.icon}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(232,230,223,.3)",marginBottom:5,fontFamily:"'JetBrains Mono',monospace" }}>{badge.tier} Badge</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#f0ede6",marginBottom:4 }}>{badge.subject}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:22,fontWeight:500,color:badge.color }}>{badge.score}%</div>
            <span style={{ fontSize:10,color:"rgba(232,230,223,.3)",fontWeight:500 }}>· {badge.earnedDate}</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:5,background:"rgba(126,203,161,.1)",border:"1px solid rgba(126,203,161,.2)",flexShrink:0 }}>
          <svg width="8" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize:9,fontWeight:800,color:GREEN,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em" }}>Earned</span>
        </div>
      </div>

      <p style={{ fontSize:12,color:"rgba(232,230,223,.4)",lineHeight:1.65,marginBottom:14,fontWeight:500 }}>{badge.desc}</p>

      <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:16 }}>
        {badge.skills.map(s => <span key={s} className="cr-skill">{s}</span>)}
      </div>

      <div style={{ display:"flex",gap:8 }}>
        <button onClick={e => { e.stopPropagation(); onShare(badge); }} style={{
          flex:1,padding:"10px",borderRadius:11,border:"none",
          background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",
          color:"rgba(232,230,223,.45)",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,
          letterSpacing:".04em",textTransform:"uppercase",cursor:"pointer",transition:"all .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.08)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.04)"}
        >Share Credential</button>
      </div>
    </div>
  );
}

function LockedBadgeCard({ badge, index }) {
  const pct = badge.progress || 0;
  return (
    <div className={`cr-card fu d${(index%6)+1}`} style={{ padding:20,opacity:.75 }}>
      <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:14 }}>
        <div className="cr-hex" style={{ width:64,height:64,background:badge.gradient,filter:"grayscale(.5)",opacity:.6 }}>
          <span style={{ fontSize:20,color:"white",fontWeight:800 }}>{badge.icon}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(232,230,223,.25)",marginBottom:4,fontFamily:"'JetBrains Mono',monospace" }}>{badge.tier} · {badge.subject}</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"rgba(240,237,230,.55)" }}>{badge.subject} {badge.tier}</div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:24,fontWeight:500,color:"rgba(232,230,223,.4)" }}>{pct}%</div>
          <div style={{ fontSize:9,color:"rgba(232,230,223,.2)",fontFamily:"'JetBrains Mono',monospace" }}>of {badge.required}% req.</div>
        </div>
      </div>

      <div style={{ height:4,borderRadius:999,background:"rgba(255,255,255,.06)",overflow:"hidden",marginBottom:10 }}>
        <div className="cr-prog-fill" style={{ "--w":`${pct}%`,background:`linear-gradient(90deg,${badge.color}80,${badge.color})` }}/>
      </div>
      <p style={{ fontSize:11,color:"rgba(232,230,223,.3)",lineHeight:1.6,fontWeight:500 }}>{badge.unlockHint}</p>
    </div>
  );
}

export default function Credentials() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [tab,         setTab]         = useState("earned");
  const [shareModal,  setShareModal]  = useState(null);
  const [verifyId,    setVerifyId]    = useState("");
  const [verifyResult,setVerifyResult]= useState(null);

  const handleVerify = () => {
    const match = earned.find(b => b.shareUrl.endsWith(verifyId.trim()));
    setVerifyResult(match ? { valid:true, badge:match } : { valid:false });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="cr-root">
        <div className="cr-blob" style={{ width:500,height:500,background:"rgba(126,203,161,.05)",top:-140,right:-120 }}/>
        <div className="cr-blob" style={{ width:380,height:380,background:"rgba(80,100,200,.03)",bottom:100,left:-80,filter:"blur(110px)",animationDelay:"5s" }}/>

        {/* Topbar */}
        <div className="cr-topbar">
          <button className="cr-btn-ghost" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
          <span className="cr-topbar-title">Credentials</span>
          <button onClick={() => setTab("verify")} className="cr-btn-ghost" style={{ fontSize:11 }}>Verify a Badge</button>
        </div>

        <div className="cr-content">
          {/* Hero */}
          <div className="fu" style={{ marginBottom:28 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.2)",marginBottom:14 }}>
              <div style={{ position:"relative",width:7,height:7,flexShrink:0 }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:GREEN,position:"absolute" }}/>
                <div style={{ width:7,height:7,borderRadius:"50%",background:GREEN,position:"absolute",animation:"ping 2.5s ease-out infinite" }}/>
              </div>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,fontFamily:"'JetBrains Mono',monospace" }}>Open Badge Credentials</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:800,letterSpacing:"-.03em",color:"#f0ede6",lineHeight:1.1,marginBottom:8 }}>
              Your{" "}
              <span style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontWeight:400,color:GREEN }}>verified</span>
              {" "}achievements.
            </h1>
            <p style={{ fontSize:14,color:"rgba(232,230,223,.35)",lineHeight:1.75,fontWeight:500 }}>
              Shareable, employer-verified credentials earned through real quiz performance.
            </p>
          </div>

          {/* Stats */}
          <div className="fu d1" style={{ display:"flex",gap:20,marginBottom:24,flexWrap:"wrap" }}>
            {[
              { label:"Earned",  val:earned.length, color:GREEN },
              { label:"Pending", val:locked.length, color:"rgba(232,230,223,.4)" },
              { label:"Total Score", val:`${Math.round(earned.reduce((a,b)=>a+b.score,0)/earned.length)}%`, color:"#cba87e" },
            ].map((s,i) => (
              <div key={s.label} style={{ padding:"14px 20px",borderRadius:14,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:30,fontWeight:500,color:s.color }}>{s.val}</div>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="fu d1" style={{ display:"flex",gap:4,marginBottom:24,padding:4,borderRadius:999,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",width:"fit-content" }}>
            {[
              { id:"earned", label:`Earned (${earned.length})` },
              { id:"locked", label:`In Progress (${locked.length})` },
              { id:"verify", label:"Verify" },
            ].map(t => (
              <button key={t.id} className={`cr-tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* EARNED */}
          {tab==="earned" && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20 }}>
              {earned.map((b,i) => (
                <EarnedBadgeCard key={b.id} badge={b} index={i} onShare={setShareModal}/>
              ))}
            </div>
          )}

          {/* LOCKED */}
          {tab==="locked" && (
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <p className="fu" style={{ fontSize:13,color:"rgba(232,230,223,.35)",marginBottom:4,fontWeight:500,lineHeight:1.7 }}>
                Complete quizzes and AI sessions to unlock these credentials. Shareable with employers once earned.
              </p>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12 }}>
                {locked.map((b,i) => <LockedBadgeCard key={b.id} badge={b} index={i}/>)}
              </div>

              {/* How to earn */}
              <div className="cr-card fu d4" style={{ padding:24,marginTop:8 }}>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:16 }}>How to Earn Badges</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10 }}>
                  {[
                    { code:"QZ", label:"Take Quizzes",     desc:"Score 70%+ on subject quizzes to build progress" },
                    { code:"AI", label:"Use AI Tutor",      desc:"Complete AI sessions for skill verification" },
                    { code:"MT", label:"Mentor Others",     desc:"High-rated mentoring sessions earn bonus progress" },
                    { code:"ST", label:"Stay Consistent",   desc:"Regular study streaks accelerate badge unlock" },
                  ].map(item => (
                    <div key={item.label} style={{ padding:"14px 16px",borderRadius:12,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)" }}>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:500,color:GREEN,marginBottom:8 }}>{item.code}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#f0ede6",marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontSize:12,color:"rgba(232,230,223,.35)",lineHeight:1.6,fontWeight:500 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VERIFY */}
          {tab==="verify" && (
            <div className="fu" style={{ maxWidth:540 }}>
              <div className="cr-card" style={{ padding:28,marginBottom:16 }}>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10 }}>Verify a Credential</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#f0ede6",marginBottom:8 }}>Employer Verification</h3>
                <p style={{ fontSize:13,color:"rgba(232,230,223,.4)",marginBottom:22,lineHeight:1.7,fontWeight:500 }}>
                  Enter a badge ID or paste a verification URL to confirm its authenticity.
                </p>
                <div style={{ display:"flex",gap:8,marginBottom:18 }}>
                  <input
                    className="cr-input"
                    value={verifyId}
                    onChange={e => { setVerifyId(e.target.value); setVerifyResult(null); }}
                    placeholder="e.g. MATH-SLV-2026-007"
                    onKeyDown={e => e.key==="Enter" && handleVerify()}
                  />
                  <button className="cr-btn-primary" style={{ whiteSpace:"nowrap" }} onClick={handleVerify}>Verify →</button>
                </div>

                {verifyResult?.valid && (
                  <div className="fu" style={{ padding:18,borderRadius:14,background:"rgba(126,203,161,.07)",border:"1px solid rgba(126,203,161,.2)",marginBottom:16 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:"rgba(126,203,161,.12)",border:"1px solid rgba(126,203,161,.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <svg width="16" height="12" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:800,color:GREEN }}>Credential Verified</div>
                        <div style={{ fontSize:11,color:"rgba(126,203,161,.7)",fontWeight:500 }}>This is a genuine PathwayAI credential</div>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12 }}>
                      {[
                        ["Badge",  `${verifyResult.badge.tier} · ${verifyResult.badge.subject}`],
                        ["Holder", user?.name||"Student"],
                        ["Issued", verifyResult.badge.earnedDate],
                        ["Score",  `${verifyResult.badge.score}%`],
                      ].map(([k,v]) => (
                        <div key={k}>
                          <span style={{ color:GREEN,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".06em",textTransform:"uppercase" }}>{k}: </span>
                          <span style={{ color:"rgba(232,230,223,.65)",fontWeight:600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {verifyResult?.valid===false && (
                  <div className="fu" style={{ padding:14,borderRadius:12,background:"rgba(203,126,154,.08)",border:"1px solid rgba(203,126,154,.25)",color:"#cb7e9a",fontSize:13,fontWeight:700,marginBottom:16 }}>
                    No matching credential found. Check the ID and try again.
                  </div>
                )}

                <div style={{ fontSize:11,color:"rgba(232,230,223,.25)",marginBottom:8,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",textTransform:"uppercase" }}>Sample IDs</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {earned.map(b => {
                    const id = b.shareUrl.split("/verify/")[1];
                    return (
                      <button key={b.id} onClick={() => { setVerifyId(id); setVerifyResult(null); }} style={{
                        padding:"4px 10px",borderRadius:20,
                        border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)",
                        color:"rgba(232,230,223,.4)",fontSize:10,fontWeight:700,cursor:"pointer",
                        fontFamily:"'JetBrains Mono',monospace",transition:"all .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor="rgba(126,203,161,.25)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}
                      >{id}</button>
                    );
                  })}
                </div>
              </div>

              <div className="cr-card" style={{ padding:22 }}>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:14 }}>What Employers See</div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {["Student's full name","Subject, tier, and skills verified","Date earned and quiz score","Signed by PathwayAI and teacher endorsement","One-click verification link"].map((item,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,color:"rgba(232,230,223,.45)",fontWeight:500 }}>
                      <div style={{ width:18,height:18,borderRadius:5,background:"rgba(126,203,161,.1)",border:"1px solid rgba(126,203,161,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <svg width="8" height="6" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {shareModal && <ShareModal badge={shareModal} user={user} onClose={() => setShareModal(null)}/>}
    </>
  );
}
