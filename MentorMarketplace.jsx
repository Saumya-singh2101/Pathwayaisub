/**
 * MentorMarketplace.jsx — PathwayAI Peer Mentors
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const GREEN = "#7ecba1";
const GREEN2 = "#a8e6c4";

const MENTORS = [
  { id:1, name:"Arjun Sharma",   avatar:"AS", color:"linear-gradient(135deg,#1D4ED8,#3B82F6)", class:"Class 12 · CBSE",  location:"Pune, MH",       subjects:["Mathematics","Physics","Coding"],     speciality:"Quadratic Equations, Calculus, Python", rating:4.9, reviews:38, sessions:62, rate:80,  badges:["Math Gold","Coding Bronze"], badgeAccents:["#cba87e","#b8864a"], languages:["English","Hindi","Marathi"], about:"I scored 98 in Math in boards and love breaking down hard concepts into simple steps.", available:["Mon 4–6 PM","Wed 5–7 PM","Sat 10 AM–1 PM"], streak:24, responseTime:"~15 min", verified:true },
  { id:2, name:"Priya Nair",     avatar:"PN", color:"linear-gradient(135deg,#7C3AED,#A78BFA)", class:"Class 11 · State", location:"Nagpur, MH",      subjects:["Science","Biology","Chemistry"],      speciality:"Cell Biology, Organic Chemistry, Ecology", rating:4.8, reviews:27, sessions:44, rate:60,  badges:["Science Silver","Biology Bronze"], badgeAccents:["#94a3b8","#b8864a"], languages:["English","Hindi","Telugu"],  about:"Biology and Chemistry are my passion — I use diagrams and mnemonics to make concepts stick.", available:["Tue 5–7 PM","Thu 4–6 PM","Sun 2–5 PM"], streak:18, responseTime:"~10 min", verified:true },
  { id:3, name:"Rohan Desai",    avatar:"RD", color:"linear-gradient(135deg,#059669,#34D399)", class:"Class 12 · ICSE",  location:"Mumbai, MH",      subjects:["History","Geography","Language"],     speciality:"Freedom Movement, Map Work, Essay Writing", rating:4.7, reviews:19, sessions:31, rate:50,  badges:["History Gold"], badgeAccents:["#cba87e"], languages:["English","Marathi","Hindi"], about:"History isn't dates — it's stories. I connect events to today's world.", available:["Mon 6–8 PM","Fri 5–7 PM","Sat 2–5 PM"], streak:12, responseTime:"~20 min", verified:true },
  { id:4, name:"Sneha Kulkarni", avatar:"SK", color:"linear-gradient(135deg,#DB2777,#F472B6)", class:"Class 10 · CBSE",  location:"Nashik, MH",      subjects:["Mathematics","Science"],              speciality:"Class 9–10 Math, Basic Science, Exam prep", rating:4.9, reviews:51, sessions:89, rate:70,  badges:["Math Silver","Science Bronze"], badgeAccents:["#94a3b8","#b8864a"], languages:["Hindi","Marathi","English"], about:"Cleared Class 10 boards with 95%. I focus heavily on CBSE exam patterns.", available:["Daily 4–6 PM","Sun All Day"], streak:42, responseTime:"~5 min", verified:true },
  { id:5, name:"Vikram Iyer",    avatar:"VI", color:"linear-gradient(135deg,#D97706,#FCD34D)", class:"Class 12 · CBSE",  location:"Chennai (Remote)", subjects:["Coding","Mathematics"],               speciality:"DSA, Competitive Programming, Calculus", rating:4.6, reviews:14, sessions:22, rate:90,  badges:["Coding Gold","Math Bronze"], badgeAccents:["#cba87e","#b8864a"], languages:["English","Tamil"],           about:"Competitive programmer who loves teaching. I help crack Olympiads.", available:["Wed 7–9 PM","Sat 6–9 PM","Sun 6–9 PM"], streak:9, responseTime:"~30 min", verified:false },
  { id:6, name:"Anjali Mehta",   avatar:"AM", color:"linear-gradient(135deg,#0891B2,#38BDF8)", class:"Class 11 · State", location:"Aurangabad, MH",  subjects:["Language","History","General GK"],    speciality:"Grammar, Literature, Current Affairs", rating:4.8, reviews:22, sessions:37, rate:45,  badges:["Language Silver"], badgeAccents:["#94a3b8"], languages:["English","Hindi","Urdu"], about:"English and Hindi literature are my strengths. Grammar, essay writing, GK.", available:["Mon–Fri 6–8 PM","Sun 10 AM–12 PM"], streak:16, responseTime:"~10 min", verified:true },
];

const SUBJECTS = ["Mathematics","Science","History","Language","Coding","General GK"];
const NEEDS = [
  { id:"concept",  label:"Understand a concept"  },
  { id:"homework", label:"Help with homework"     },
  { id:"exam",     label:"Exam preparation"       },
  { id:"doubt",    label:"Clear a specific doubt" },
  { id:"practice", label:"Practice & mock tests"  },
];
const BUDGETS = [
  { id:"any",  label:"Any",       max:999 },
  { id:"low",  label:"Under 60",  max:60  },
  { id:"mid",  label:"60–80",     max:80  },
  { id:"high", label:"80+",       max:999 },
];
const ALL_LANGS = [...new Set(MENTORS.flatMap(m => m.languages))].sort();

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@keyframes fade-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes scale-in{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
@keyframes slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes blob-drift{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-18px)scale(1.04)}66%{transform:translate(-18px,22px)scale(.97)}}

.fu{animation:fade-up .55s cubic-bezier(.16,1,.3,1) both}
.si{animation:scale-in .45s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
.d4{animation-delay:.24s}.d5{animation-delay:.3s}.d6{animation-delay:.36s}

/* ── Root ── */
.mn-root{min-height:100vh;background:#0c0c0f;position:relative;overflow-x:hidden}
.mn-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}

/* ── Topbar ── */
.mn-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(12,12,15,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:14px 28px;display:flex;align-items:center;gap:12px;
}
.mn-topbar-title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:#f0ede6;flex:1}

/* ── Btns ── */
.mn-btn-ghost{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.mn-btn-ghost:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.mn-btn-primary{
  padding:12px 24px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${GREEN},${GREEN2},${GREEN});background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.mn-btn-primary:hover{background-position:right;transform:translateY(-1px)}

/* ── Card ── */
.mn-card{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:20px;
  position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.mn-card::before{content:'';position:absolute;inset:0;border-radius:20px;background:linear-gradient(135deg,rgba(126,203,161,.03),transparent 60%);pointer-events:none}
.mn-card:hover{border-color:rgba(126,203,161,.14);transform:translateY(-3px)}

/* ── Filter chips ── */
.mn-chip{
  padding:7px 16px;border-radius:20px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.03);
  color:rgba(232,230,223,.4);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.mn-chip:hover{border-color:rgba(255,255,255,.18);color:rgba(232,230,223,.75)}
.mn-chip.active{background:rgba(126,203,161,.1);border-color:rgba(126,203,161,.3);color:${GREEN}}

.mn-need-chip{
  padding:10px 14px;border-radius:12px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  color:rgba(232,230,223,.4);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;text-align:left;
}
.mn-need-chip:hover{border-color:rgba(255,255,255,.15);color:rgba(232,230,223,.75)}
.mn-need-chip.active{background:rgba(126,203,161,.08);border-color:rgba(126,203,161,.25);color:${GREEN}}

/* ── Mentor card ── */
.mn-mentor-card{
  padding:24px;border-radius:20px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  position:relative;overflow:hidden;
  transition:all .28s cubic-bezier(.16,1,.3,1);
}
.mn-mentor-card::before{content:'';position:absolute;inset:0;border-radius:20px;background:linear-gradient(135deg,rgba(126,203,161,.03),transparent 60%);pointer-events:none}
.mn-mentor-card:hover{border-color:rgba(126,203,161,.2);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.4)}

/* ── Avatar ── */
.mn-avatar{
  width:52px;height:52px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:white;flex-shrink:0;
}

/* ── Stars ── */
.mn-stars{color:#cba87e;letter-spacing:-1px;font-size:13px}

/* ── Label ── */
.mn-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;color:rgba(126,203,161,.6);margin-bottom:12px}

/* ── Verified ── */
.mn-verified{
  display:inline-flex;align-items:center;gap:4px;
  padding:2px 8px;border-radius:5px;font-size:9px;font-weight:800;
  font-family:'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;
  background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.2);color:${GREEN};
}

/* ── Subject pill ── */
.mn-pill{
  padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
  color:rgba(232,230,223,.45);
}

/* ── Modal ── */
.mn-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center}
.mn-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px)}
.mn-modal{
  position:relative;z-index:1;width:100%;max-width:520px;
  border-radius:24px;overflow:hidden;
  animation:scale-in .35s cubic-bezier(.16,1,.3,1) both;
  max-height:92vh;overflow-y:auto;
  background:#111115;
  border:1px solid rgba(255,255,255,.1);
  box-shadow:0 32px 80px rgba(0,0,0,.6);
}
.mn-modal::-webkit-scrollbar{width:4px}
.mn-modal::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

/* ── Modal input ── */
.mn-input{
  width:100%;padding:11px 14px;border-radius:11px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:#e8e6df;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  outline:none;transition:border-color .2s;
}
.mn-input:focus{border-color:rgba(126,203,161,.3)}
.mn-input::placeholder{color:rgba(232,230,223,.2)}

/* ── Slot btn ── */
.mn-slot{
  padding:9px 14px;border-radius:10px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.03);
  color:rgba(232,230,223,.45);
  font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;
  cursor:pointer;transition:all .2s;text-align:left;
}
.mn-slot:hover{border-color:rgba(255,255,255,.18);color:rgba(232,230,223,.75)}
.mn-slot.active{background:rgba(126,203,161,.1);border-color:rgba(126,203,161,.3);color:${GREEN}}

/* ── Confirm ── */
.mn-confirm-ring{
  width:72px;height:72px;border-radius:50%;
  background:rgba(126,203,161,.1);border:2px solid rgba(126,203,161,.3);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 20px;
}

/* content container */
.mn-content{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:32px 28px}
`;

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="mn-stars">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half?1:0))}
    </span>
  );
}

function MentorCard({ mentor, onBook, index }) {
  return (
    <div className={`mn-mentor-card fu d${(index%6)+1}`}>
      {/* Top */}
      <div style={{ display:"flex",gap:14,alignItems:"flex-start",marginBottom:16 }}>
        <div className="mn-avatar" style={{ background:mentor.color }}>{mentor.avatar}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3 }}>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f0ede6" }}>{mentor.name}</span>
            {mentor.verified && <span className="mn-verified">Verified</span>}
          </div>
          <div style={{ fontSize:11,color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:6 }}>{mentor.class} · {mentor.location}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <Stars rating={mentor.rating}/>
            <span style={{ fontSize:12,fontWeight:700,color:"#f0ede6" }}>{mentor.rating}</span>
            <span style={{ fontSize:11,color:"rgba(232,230,223,.3)" }}>({mentor.reviews})</span>
            <div style={{ width:6,height:6,borderRadius:"50%",background:GREEN,boxShadow:`0 0 6px ${GREEN}` }}/>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:28,fontWeight:500,color:GREEN }}>Rs{mentor.rate}</div>
          <div style={{ fontSize:10,color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace" }}>per session</div>
        </div>
      </div>

      {/* Subjects */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
        {mentor.subjects.map(s => <span key={s} className="mn-pill">{s}</span>)}
      </div>

      {/* Speciality */}
      <p style={{ fontSize:12,color:"rgba(232,230,223,.4)",marginBottom:14,lineHeight:1.6,fontWeight:500 }}>
        <span style={{ color:"rgba(232,230,223,.65)",fontWeight:700 }}>Specialises in: </span>{mentor.speciality}
      </p>

      {/* Badges */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:14 }}>
        {mentor.badges.map((b,i) => (
          <span key={b} style={{
            padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,
            background:`${mentor.badgeAccents[i]}18`,border:`1px solid ${mentor.badgeAccents[i]}40`,
            color:mentor.badgeAccents[i],fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",
          }}>{b}</span>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display:"flex",gap:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.06)",marginBottom:16 }}>
        {[
          { label:"Sessions",  val:mentor.sessions },
          { label:"Streak",    val:`${mentor.streak} days` },
          { label:"Response",  val:mentor.responseTime },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:20,fontWeight:500,color:"#f0ede6" }}>{s.val}</div>
            <div style={{ fontSize:10,color:"rgba(232,230,223,.3)",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em" }}>{s.label}</div>
          </div>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <div style={{ fontSize:10,color:"rgba(232,230,223,.3)",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",marginBottom:3 }}>Languages</div>
          <div style={{ fontSize:12,color:"rgba(232,230,223,.55)",fontWeight:600 }}>{mentor.languages.join(", ")}</div>
        </div>
      </div>

      <button className="mn-btn-primary" style={{ width:"100%" }} onClick={() => onBook(mentor)}>
        Book a Session — Rs{mentor.rate}
      </button>
    </div>
  );
}

function BookModal({ mentor, subject, need, onClose, onConfirm }) {
  const [slot,   setSlot]   = useState(null);
  const [note,   setNote]   = useState("");
  const [step,   setStep]   = useState(1);
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r,1600));
    setPaying(false);
    setStep(3);
  };

  return (
    <div className="mn-overlay">
      <div className="mn-backdrop" onClick={step<3?onClose:undefined}/>
      <div className="mn-modal">

        {/* Header */}
        <div style={{ padding:"22px 24px 18px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:14 }}>
          <div className="mn-avatar" style={{ width:44,height:44,borderRadius:13,background:mentor.color,fontSize:14 }}>{mentor.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f0ede6" }}>{mentor.name}</div>
            <div style={{ fontSize:10,color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace" }}>{mentor.class}</div>
          </div>
          {step < 3 && (
            <button onClick={onClose} style={{ background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"5px 8px",color:"rgba(232,230,223,.35)",cursor:"pointer",fontSize:13 }}>✕</button>
          )}
        </div>

        {step < 3 ? (
          <div style={{ padding:24 }}>
            {/* Progress */}
            <div style={{ display:"flex",gap:6,marginBottom:22 }}>
              {[1,2].map(i => (
                <div key={i} style={{ flex:1,height:3,borderRadius:999,background:i<=step?"rgba(126,203,161,.6)":"rgba(255,255,255,.07)",transition:"background .3s" }}/>
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="mn-label">Select Time Slot</div>
                <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:20 }}>
                  {mentor.available.map(s => (
                    <button key={s} className={`mn-slot ${slot===s?"active":""}`} onClick={() => setSlot(s)}>{s}</button>
                  ))}
                </div>
                <div className="mn-label" style={{ marginTop:4 }}>Note for Mentor (optional)</div>
                <textarea
                  className="mn-input"
                  rows={3}
                  placeholder="What do you want help with?"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ resize:"none" }}
                />
                <button
                  className="mn-btn-primary" style={{ width:"100%",marginTop:16 }}
                  disabled={!slot}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mn-label">Confirm Booking</div>
                {[
                  ["Mentor",  mentor.name],
                  ["Subject", subject || "General"],
                  ["Slot",    slot],
                  ["Rate",    `Rs ${mentor.rate}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize:12,color:"rgba(232,230,223,.35)",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",textTransform:"uppercase" }}>{k}</span>
                    <span style={{ fontSize:13,fontWeight:700,color:"#f0ede6" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex",gap:8,marginTop:20 }}>
                  <button className="mn-btn-ghost" onClick={() => setStep(1)} style={{ flex:1 }}>← Back</button>
                  <button className="mn-btn-primary" style={{ flex:2 }} onClick={handlePay} disabled={paying}>
                    {paying ? "Processing…" : `Pay Rs ${mentor.rate} →`}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding:36,textAlign:"center" }}>
            <div className="mn-confirm-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f0ede6",marginBottom:8 }}>Session Booked</h3>
            <p style={{ fontSize:13,color:"rgba(232,230,223,.4)",lineHeight:1.75,fontWeight:500,marginBottom:8 }}>
              Your session with <span style={{ color:"#f0ede6",fontWeight:700 }}>{mentor.name}</span> is confirmed for{" "}
              <span style={{ color:GREEN,fontWeight:700 }}>{slot}</span>.
            </p>
            <p style={{ fontSize:12,color:"rgba(232,230,223,.3)",marginBottom:24,fontFamily:"'JetBrains Mono',monospace" }}>
              You'll receive a link 15 min before.
            </p>
            <button className="mn-btn-primary" style={{ minWidth:160 }} onClick={() => onConfirm(mentor)}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MentorMarketplace() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [step,      setStep]      = useState("filter");
  const [subject,   setSubject]   = useState(null);
  const [need,      setNeed]      = useState(null);
  const [budget,    setBudget]    = useState("any");
  const [language,  setLang]      = useState(null);
  const [bookModal, setBookModal] = useState(null);
  const [booked,    setBooked]    = useState([]);

  const budgetMax = BUDGETS.find(b => b.id===budget)?.max || 999;
  const matched = MENTORS.filter(m => {
    if (subject && !m.subjects.includes(subject)) return false;
    if (m.rate > budgetMax) return false;
    if (language && !m.languages.includes(language)) return false;
    return true;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="mn-root">
        <div className="mn-blob" style={{ width:520,height:520,background:"rgba(126,203,161,.05)",top:-140,right:-120 }}/>
        <div className="mn-blob" style={{ width:380,height:380,background:"rgba(80,100,200,.03)",bottom:100,left:-80,filter:"blur(110px)",animationDelay:"5s" }}/>

        {/* Topbar */}
        <div className="mn-topbar">
          <button className="mn-btn-ghost" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
          <span className="mn-topbar-title">
            {step==="list" ? `${matched.length} Mentors` : "Find a Mentor"}
          </span>
          {step==="list" && (
            <button className="mn-btn-ghost" onClick={() => setStep("filter")}>← Filters</button>
          )}
        </div>

        <div className="mn-content">

          {/* ── FILTER STEP ── */}
          {step === "filter" && (
            <>
              {/* Hero */}
              <div className="fu" style={{ marginBottom:36 }}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.2)",marginBottom:16 }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:GREEN }}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,fontFamily:"'JetBrains Mono',monospace" }}>Peer Mentors · PathwayAI</span>
                </div>
                <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,5vw,42px)",fontWeight:800,letterSpacing:"-.03em",color:"#f0ede6",lineHeight:1.1,marginBottom:10 }}>
                  Learn from{" "}
                  <span style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontWeight:400,color:GREEN }}>students like you.</span>
                </h1>
                <p style={{ fontSize:14,color:"rgba(232,230,223,.35)",lineHeight:1.75,fontWeight:500,maxWidth:440 }}>
                  Peer mentors who've already cracked the same syllabus. Affordable, relatable, effective.
                </p>
              </div>

              {/* Filter card */}
              <div className="mn-card fu d1" style={{ padding:28,marginBottom:20 }}>

                {/* Subject */}
                <div style={{ marginBottom:22 }}>
                  <div className="mn-label">Subject</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                    {SUBJECTS.map(s => (
                      <button key={s} className={`mn-chip ${subject===s?"active":""}`}
                        onClick={() => setSubject(subject===s?null:s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Need */}
                <div style={{ marginBottom:22 }}>
                  <div className="mn-label">Type of Help</div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:7 }}>
                    {NEEDS.map(n => (
                      <button key={n.id} className={`mn-need-chip ${need?.id===n.id?"active":""}`}
                        onClick={() => setNeed(need?.id===n.id?null:n)}>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget + Language */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                  <div>
                    <div className="mn-label">Budget / Session (Rs)</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                      {BUDGETS.map(b => (
                        <button key={b.id} className={`mn-chip ${budget===b.id?"active":""}`}
                          onClick={() => setBudget(b.id)}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mn-label">Language</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                      {ALL_LANGS.map(l => (
                        <button key={l} className={`mn-chip ${language===l?"active":""}`}
                          onClick={() => setLang(language===l?null:l)}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <div className="mn-card fu d2" style={{ padding:20,display:"flex",gap:0,flexWrap:"wrap",justifyContent:"center",marginBottom:28 }}>
                {[
                  { label:"Active Mentors", val:`${MENTORS.length}+` },
                  { label:"Avg Rating",     val:"4.8" },
                  { label:"Sessions Done",  val:"285+" },
                  { label:"Starting From",  val:"Rs 45" },
                  { label:"Languages",      val:"9 Indian" },
                ].map((s,i) => (
                  <React.Fragment key={s.label}>
                    {i>0 && <div style={{ width:1,background:"rgba(255,255,255,.07)",alignSelf:"stretch",margin:"0 20px" }}/>}
                    <div style={{ textAlign:"center",padding:"4px 0" }}>
                      <div style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:26,fontWeight:500,color:GREEN }}>{s.val}</div>
                      <div style={{ fontSize:10,fontWeight:700,color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",textTransform:"uppercase" }}>{s.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="fu d3" style={{ textAlign:"center" }}>
                <button className="mn-btn-primary" style={{ fontSize:15,padding:"15px 44px" }}
                  onClick={() => setStep("list")}>
                  Find Mentors ({matched.length} available) →
                </button>
              </div>
            </>
          )}

          {/* ── LIST STEP ── */}
          {step === "list" && (
            <>
              {/* Active filters */}
              {(subject || need || budget!=="any" || language) && (
                <div className="fu" style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
                  {subject  && <span className="mn-chip active" style={{ cursor:"default" }}>{subject}</span>}
                  {need     && <span className="mn-chip active" style={{ cursor:"default" }}>{need.label}</span>}
                  {budget!=="any" && <span className="mn-chip active" style={{ cursor:"default" }}>{BUDGETS.find(b=>b.id===budget)?.label}</span>}
                  {language && <span className="mn-chip active" style={{ cursor:"default" }}>{language}</span>}
                  <button className="mn-btn-ghost" style={{ padding:"4px 10px",fontSize:11 }}
                    onClick={() => { setSubject(null); setBudget("any"); setLang(null); setNeed(null); }}>
                    Clear all
                  </button>
                </div>
              )}

              {matched.length === 0 ? (
                <div className="mn-card" style={{ padding:40,textAlign:"center" }}>
                  <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(232,230,223,.2)",fontFamily:"'JetBrains Mono',monospace",marginBottom:12 }}>No results</div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#f0ede6",marginBottom:8 }}>No mentors match your filters</h3>
                  <p style={{ color:"rgba(232,230,223,.35)",fontSize:14,marginBottom:20,fontWeight:500 }}>Try removing the budget or language filter</p>
                  <button className="mn-btn-primary" onClick={() => { setBudget("any"); setLang(null); }}>Reset Filters</button>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20 }}>
                  {matched.map((m,i) => (
                    <MentorCard key={m.id} mentor={m} onBook={setBookModal} index={i}/>
                  ))}
                </div>
              )}

              {/* Become a mentor CTA */}
              <div className="fu" style={{
                marginTop:32,borderRadius:20,padding:28,
                background:"rgba(126,203,161,.04)",
                border:"1px solid rgba(126,203,161,.12)",
                textAlign:"center",
              }}>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10 }}>Earn as Mentor</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#f0ede6",marginBottom:8 }}>Your Score is High Enough to Mentor</h3>
                <p style={{ fontSize:14,color:"rgba(232,230,223,.35)",marginBottom:20,maxWidth:400,margin:"0 auto 20px",lineHeight:1.75,fontWeight:500 }}>
                  Silver or Gold badge in any subject qualifies you to earn Rs 50–150 per session as a peer mentor.
                </p>
                <button className="mn-btn-primary">Apply to Become a Mentor →</button>
              </div>
            </>
          )}
        </div>

        {bookModal && (
          <BookModal
            mentor={bookModal}
            subject={subject}
            need={need}
            onClose={() => setBookModal(null)}
            onConfirm={(m) => { setBooked(prev => [...prev,m]); setBookModal(null); }}
          />
        )}
      </div>
    </>
  );
}
