/**
 * StudyPlan.jsx — PathwayAI Study Roadmap
 * Redesigned to match PathwayAI dark aesthetic
 * Real-time streaming via Groq (llama-3.3-70b-versatile)
 *
 * DROP-IN REPLACEMENT — update GROQ_API_KEY below or pass via env
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

/* ────────────────────────────────────────────────────────────
   CONFIG  — swap your key here
──────────────────────────────────────────────────────────── */
const GROQ_API_KEY   = import.meta.env?.VITE_GROQ_API_KEY || "HIIIIIIIII";
const GROQ_MODEL     = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT  = "https://api.groq.com/openai/v1/chat/completions";

/* ────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────── */
const SUBJECTS_LIST = [
  "Mathematics","Physics","Chemistry","Biology",
  "History","Geography","Political Science","Economics",
  "English","Hindi","Computer Science","Coding / Programming",
  "General Knowledge","Reasoning & Aptitude",
];

const GOALS = [
  { id:"board",       label:"Board Exams"        },
  { id:"jee",         label:"JEE / NEET"          },
  { id:"competitive", label:"Competitive Exams"   },
  { id:"college",     label:"College Assignments" },
  { id:"skill",       label:"Skill Building"      },
  { id:"interview",   label:"Interview Prep"      },
];

const HOURS_OPTIONS = ["1","2","3","4","5","6+"];
const DAYS          = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT     = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

const ACCENT   = "#6EE7B7";   // mint green from the logo
const ACCENT2  = "#34D399";
const BG       = "#0D1117";   // deep dark
const SURFACE  = "#141C24";
const SURFACE2 = "#1A2332";
const BORDER   = "rgba(110,231,183,0.15)";
const TEXT     = "#E2F5EE";
const MUTED    = "#4D7568";

/* ────────────────────────────────────────────────────────────
   GLOBAL CSS  — PathwayAI aesthetic
──────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent:  #6EE7B7;
    --accent2: #34D399;
    --bg:      #0D1117;
    --surf:    #141C24;
    --surf2:   #1A2332;
    --border:  rgba(110,231,183,0.15);
    --text:    #E2F5EE;
    --muted:   #4D7568;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scanline {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(110,231,183,0); }
    50%      { box-shadow: 0 0 20px 4px rgba(110,231,183,0.2); }
  }
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes shimmer-mint {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes dot-pulse {
    0%,100% { transform:scale(1);   opacity:0.5; }
    50%      { transform:scale(1.5); opacity:1; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes reveal {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }
  @keyframes card-in {
    from { opacity:0; transform:translateY(12px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes stream-cursor {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes bar-grow {
    from { width:0; }
    to   { width:var(--w,100%); }
  }

  .fade-up  { animation: fadeUp  0.45s ease both; }
  .card-in  { animation: card-in 0.4s cubic-bezier(0.16,1,0.3,1) both; }

  .mint-text {
    background: linear-gradient(90deg, #6EE7B7, #34D399, #6EE7B7);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-mint 3s linear infinite;
  }

  .chip-btn {
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.16,1,0.3,1);
    outline: none;
  }
  .chip-btn:hover  { transform: translateY(-1px); }
  .chip-btn:active { transform: scale(0.97); }

  .day-card {
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .day-card:hover {
    border-color: rgba(110,231,183,0.35) !important;
    box-shadow: 0 0 16px rgba(110,231,183,0.08);
  }

  .sess-node {
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .sess-node:hover {
    border-color: var(--accent) !important;
    background: rgba(110,231,183,0.08) !important;
  }

  /* Scanline overlay */
  .scanline-wrap {
    position: fixed; inset:0; overflow:hidden; pointer-events:none; z-index:0;
  }
  .scanline-wrap::after {
    content:'';
    position:absolute; left:0; right:0; height:2px;
    background: linear-gradient(transparent, rgba(110,231,183,0.04), transparent);
    animation: scanline 8s linear infinite;
  }

  /* Grid noise bg */
  .grid-bg {
    position: fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .stream-text {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    line-height: 1.7;
    color: var(--accent);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .stream-cursor {
    display: inline-block;
    width: 8px; height: 14px;
    background: var(--accent);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: stream-cursor 0.7s step-end infinite;
  }

  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) hue-rotate(100deg); }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: rgba(110,231,183,0.2); border-radius:3px; }

  @media (max-width:640px) { .hide-sm { display:none !important; } }
`;

/* ────────────────────────────────────────────────────────────
   PARSER
──────────────────────────────────────────────────────────── */
function parsePlan(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const plan  = { title:"", summary:"", weeklyGoal:"", days:{}, tips:[], milestones:[], books:[] };
  let curDay  = null;
  let curSess = null;
  let curBook = null;

  const flushSess = () => {
    if (curSess && curDay) {
      if (!plan.days[curDay]) plan.days[curDay] = { sessions:[], isRest:false };
      plan.days[curDay].sessions.push(curSess);
      curSess = null;
    }
  };
  const flushBook = () => { if (curBook) { plan.books.push(curBook); curBook = null; } };

  for (const line of lines) {
    if (line.startsWith("TITLE:"))     { plan.title      = line.slice(6).trim();     continue; }
    if (line.startsWith("SUMMARY:"))   { plan.summary     = line.slice(8).trim();     continue; }
    if (line.startsWith("GOAL:"))      { plan.weeklyGoal  = line.slice(5).trim();     continue; }
    if (line.startsWith("TIP:"))       { plan.tips.push(line.slice(4).trim());        continue; }
    if (line.startsWith("MILESTONE:")) { plan.milestones.push(line.slice(10).trim()); continue; }

    if (line.startsWith("BOOK:"))  { flushSess(); flushBook(); curBook = { title:line.slice(5).trim(), author:"", why:"", rating:5 }; continue; }
    if (line.startsWith("AUTHOR:") && curBook) { curBook.author = line.slice(7).trim(); continue; }
    if (line.startsWith("WHY:")    && curBook) { curBook.why    = line.slice(4).trim(); continue; }
    if (line.startsWith("RATING:") && curBook) { curBook.rating = parseFloat(line.slice(7)) || 5; continue; }

    if (line.startsWith("DAY:")) {
      flushSess(); flushBook();
      curDay = line.slice(4).trim();
      if (!plan.days[curDay]) plan.days[curDay] = { sessions:[], isRest: curDay==="Sunday" };
      continue;
    }
    if (/^REST/i.test(line) && curDay) { plan.days[curDay].isRest = true; continue; }

    if (line.startsWith("SUBJECT:") && curDay) {
      flushSess();
      const hoursM = line.match(/HOURS:\s*([\d.]+)/i);
      const subj   = line.replace(/HOURS:[\d.\s]+/i,"").replace("SUBJECT:","").replace(/\|/g,"").trim();
      curSess = { subject:subj, hours: hoursM ? parseFloat(hoursM[1]) : 1, topic:"", tasks:[] };
      continue;
    }
    if (line.startsWith("TOPIC:") && curDay) {
      if (!curSess) curSess = { subject:"Study", hours:1, topic:"", tasks:[] };
      curSess.topic = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("TASK:")  && curSess) { curSess.tasks.push(line.slice(5).trim()); continue; }
    if (line.startsWith("TASKS:") && curSess) {
      curSess.tasks = line.slice(6).split(",").map(x=>x.trim()).filter(Boolean);
      continue;
    }
  }
  flushSess(); flushBook();
  for (const d of DAYS) if (!plan.days[d]) plan.days[d] = { sessions:[], isRest: d==="Sunday" };
  return plan;
}

/* ────────────────────────────────────────────────────────────
   GROQ STREAMING
──────────────────────────────────────────────────────────── */
async function streamGroq({ prompt, onChunk, onDone, onError }) {
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:  GROQ_MODEL,
        stream: true,
        max_tokens: 2800,
        messages: [{ role:"user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   full    = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;
        try {
          const json   = JSON.parse(trimmed.slice(6));
          const delta  = json.choices?.[0]?.delta?.content || "";
          if (delta) { full += delta; onChunk(full); }
        } catch { /* skip malformed */ }
      }
    }
    onDone(full);
  } catch(e) {
    onError(e.message);
  }
}

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
──────────────────────────────────────────────────────────── */

function Tag({ children, color = ACCENT }) {
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:4,
      background:`${color}14`, border:`1px solid ${color}40`,
      color, fontSize:11, fontWeight:700, fontFamily:"'Space Mono',monospace",
      letterSpacing:"0.08em", textTransform:"uppercase",
    }}>{children}</span>
  );
}

function SessionNode({ sess, dark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sess-node" onClick={() => setOpen(!open)} style={{
      borderRadius:8, padding:"9px 12px",
      background: open ? "rgba(110,231,183,0.07)" : "rgba(110,231,183,0.03)",
      border:`1px solid ${open ? "rgba(110,231,183,0.35)" : "rgba(110,231,183,0.1)"}`,
      marginBottom:6,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:ACCENT, flexShrink:0 }} />
        <span style={{ fontSize:11, fontWeight:700, color:ACCENT, fontFamily:"'Space Mono',monospace", flex:1, letterSpacing:"0.04em" }}>
          {sess.subject}
        </span>
        <span style={{ fontSize:10, color:MUTED, fontFamily:"'Space Mono',monospace" }}>{sess.hours}h</span>
        <span style={{ fontSize:9, color:MUTED, transform: open?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
      </div>
      {sess.topic && (
        <p style={{ fontSize:11, color:TEXT, margin:"5px 0 0 13px", lineHeight:1.4, opacity:0.8 }}>{sess.topic}</p>
      )}
      {open && sess.tasks.length > 0 && (
        <div style={{ marginTop:8, paddingLeft:13 }}>
          {sess.tasks.map((tk,i) => (
            <div key={i} style={{ display:"flex", gap:6, marginBottom:4 }}>
              <span style={{ color:ACCENT, fontSize:8, marginTop:4, flexShrink:0 }}>+</span>
              <span style={{ fontSize:11, color:MUTED, lineHeight:1.5 }}>{tk}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DayCol({ day, data, di }) {
  const isRest  = data.isRest || data.sessions.length === 0;
  const totalH  = data.sessions.reduce((s,x) => s+(x.hours||1), 0);
  return (
    <div className="day-card" style={{
      width:188, flexShrink:0,
      background: SURFACE,
      border:`1px solid ${isRest ? "rgba(110,231,183,0.06)" : BORDER}`,
      borderRadius:10, overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:"10px 12px",
        background: isRest ? "transparent" : "rgba(110,231,183,0.05)",
        borderBottom:`1px solid ${isRest ? "rgba(110,231,183,0.04)" : BORDER}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{
          fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700,
          letterSpacing:"0.14em", textTransform:"uppercase",
          color: isRest ? MUTED : ACCENT,
        }}>{DAY_SHORT[di]}</span>
        {!isRest && (
          <Tag>{totalH}h</Tag>
        )}
        {isRest && (
          <span style={{ fontSize:10, color:MUTED, fontFamily:"'Space Mono',monospace" }}>REST</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding:"10px 10px 12px" }}>
        {!isRest && data.sessions.length > 0
          ? data.sessions.map((sess,si) => <SessionNode key={si} sess={sess} />)
          : <p style={{ fontSize:11, color:MUTED, fontStyle:"italic", textAlign:"center", padding:"12px 0", fontFamily:"'Space Mono',monospace" }}>light review</p>
        }
      </div>
    </div>
  );
}

function BookCard({ book, idx }) {
  const stars = Math.round(Math.min(5, Math.max(1, book.rating)));
  return (
    <div className="card-in" style={{
      animationDelay:`${idx*0.06}s`,
      display:"flex", gap:14, padding:"16px", borderRadius:10,
      background:SURFACE, border:`1px solid ${BORDER}`,
      transition:"border-color 0.2s", cursor:"default",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor="rgba(110,231,183,0.35)"}
    onMouseLeave={e => e.currentTarget.style.borderColor=BORDER}
    >
      <div style={{
        width:44, minHeight:64, borderRadius:6, flexShrink:0,
        background:`linear-gradient(160deg, rgba(110,231,183,0.15), rgba(110,231,183,0.05))`,
        border:`1px solid ${BORDER}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Space Mono',monospace", fontSize:18, color:ACCENT,
        position:"relative", overflow:"hidden",
      }}>
        <span style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:ACCENT, opacity:0.6 }} />
        B
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:13, fontWeight:700, color:TEXT, lineHeight:1.3, marginBottom:3 }}>{book.title}</p>
        {book.author && <p style={{ fontSize:11, color:MUTED, marginBottom:6 }}>{book.author}</p>}
        <div style={{ display:"flex", gap:2, marginBottom:6 }}>
          {Array.from({length:5}).map((_,i) => (
            <span key={i} style={{ fontSize:11, color: i < stars ? ACCENT : "rgba(110,231,183,0.15)" }}>★</span>
          ))}
        </div>
        {book.why && <p style={{ fontSize:11, color:MUTED, lineHeight:1.5, fontStyle:"italic" }}>{book.why}</p>}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   WIZARD STEPS
──────────────────────────────────────────────────────────── */
const STEPS = [
  { id:"subjects", label:"SUBJECTS",  question:"Which subjects do you want to study?",   hint:"Select all that apply." },
  { id:"goal",     label:"GOAL",      question:"What is your primary objective?",          hint:"Choose one focus area." },
  { id:"hours",    label:"HOURS",     question:"How many hours can you commit per day?",   hint:"Consistency beats cramming." },
  { id:"exam",     label:"DEADLINE",  question:"Do you have an upcoming exam or deadline?",hint:"Optional — leave blank to skip." },
  { id:"note",     label:"CONTEXT",   question:"Anything else we should factor in?",       hint:"Weak topics, schedule, learning style..." },
];

function TypewriterText({ text, speed=20 }) {
  const [shown, setShown] = useState("");
  const [done,  setDone]  = useState(false);
  useEffect(() => {
    setShown(""); setDone(false); let i=0;
    const iv = setInterval(() => {
      i++; setShown(text.slice(0,i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return (
    <span>
      {shown}
      {!done && <span style={{ display:"inline-block", width:2, height:"0.9em", background:TEXT, marginLeft:2, verticalAlign:"middle", animation:"blink 0.7s step-end infinite" }} />}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────── */
export default function StudyPlan() {
  const navigate  = useNavigate();
  const { dark, toggleDark } = useApp();

  const [screen,   setScreen]   = useState("wizard");   // wizard | generating | roadmap
  const [step,     setStep]     = useState(0);
  const [stepKey,  setStepKey]  = useState(0);

  const [subjects, setSubjects] = useState([]);
  const [goal,     setGoal]     = useState(null);
  const [hours,    setHours]    = useState("2");
  const [examDate, setExamDate] = useState("");
  const [note,     setNote]     = useState("");

  const [plan,        setPlan]        = useState(null);
  const [error,       setError]       = useState(null);
  const [streamText,  setStreamText]  = useState("");
  const [streamDone,  setStreamDone]  = useState(false);

  const streamRef = useRef(null);

  const canAdvance = () => {
    if (step === 0) return subjects.length > 0;
    if (step === 1) return goal !== null;
    if (step === 2) return hours !== "";
    return true;
  };

  const advance = () => {
    if (step < STEPS.length - 1) { setStep(s=>s+1); setStepKey(k=>k+1); }
    else generate();
  };

  const back = () => {
    if (step > 0) { setStep(s=>s-1); setStepKey(k=>k+1); }
  };

  /* ─── Generate ─── */
  const generate = async () => {
    setScreen("generating");
    setStreamText("");
    setStreamDone(false);
    setError(null);

    const daysUntil = examDate
      ? Math.ceil((new Date(examDate) - new Date()) / 86400000)
      : null;

    const prompt = `You are a world-class academic study planner. Output ONLY a 7-day study plan AND book recommendations in the EXACT format below. No JSON. No markdown. No asterisks. No extra text.

TITLE: [Short motivating title, max 8 words]
SUMMARY: [2 sentences on the weekly strategy]
GOAL: [One sentence on what the student achieves this week]

DAY: Monday
SUBJECT: [subject name] | HOURS: [number like 1.5]
TOPIC: [specific topic for this session]
TASKS: [task 1], [task 2], [task 3]

DAY: Tuesday
SUBJECT: [subject] | HOURS: [number]
TOPIC: [topic]
TASKS: [task 1], [task 2]

DAY: Wednesday
SUBJECT: [subject] | HOURS: [number]
TOPIC: [topic]
TASKS: [task 1], [task 2], [task 3]

DAY: Thursday
SUBJECT: [subject] | HOURS: [number]
TOPIC: [topic]
TASKS: [task 1], [task 2]

DAY: Friday
SUBJECT: [subject] | HOURS: [number]
TOPIC: [topic]
TASKS: [task 1], [task 2], [task 3]

DAY: Saturday
SUBJECT: [subject] | HOURS: [number]
TOPIC: [revision or practice test]
TASKS: [task 1], [task 2]

DAY: Sunday
REST

TIP: [practical study tip 1]
TIP: [practical study tip 2]
TIP: [practical study tip 3]
TIP: [practical study tip 4]
MILESTONE: [what student completes by mid-week]
MILESTONE: [what student achieves by end of week]

BOOK: [Book title]
AUTHOR: [Author name]
WHY: [One sentence why this book helps]
RATING: [1-5]

BOOK: [Book title 2]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [1-5]

BOOK: [Book title 3]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [1-5]

BOOK: [Book title 4]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [1-5]

===
Student details:
Subjects: ${subjects.join(", ")}
Hours per day: ${hours}
Goal: ${goal?.label || "General improvement"}
Days until exam: ${daysUntil ? daysUntil + " days" : "Not specified"}
Notes: ${note || "None"}
${daysUntil && daysUntil < 14 ? "URGENT: Exam soon — prioritise high-weightage topics and past papers." : ""}

IMPORTANT: Output ONLY from TITLE: to the last BOOK/RATING line. Nothing else. Recommend real, well-known books. Include at least 4 books.`;

    await streamGroq({
      prompt,
      onChunk: (text) => { setStreamText(text); },
      onDone:  (text) => {
        setStreamDone(true);
        const parsed = parsePlan(text);
        setPlan(parsed);
        setTimeout(() => setScreen("roadmap"), 800);
      },
      onError: (msg) => {
        setError("Generation failed: " + msg);
        setScreen("wizard");
        setStep(4);
      },
    });
  };

  /* ── Shared layout wrappers ── */
  const Wrap = ({ children, style={} }) => (
    <div style={{
      minHeight:"100vh", background:BG, color:TEXT,
      fontFamily:"'Space Grotesk',sans-serif", position:"relative",
      overflow:"hidden", ...style,
    }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="grid-bg" />
      <div className="scanline-wrap" />
      {children}
    </div>
  );

  const Nav = ({ children }) => (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      display:"flex", alignItems:"center", gap:12, padding:"14px 24px",
      background:"rgba(13,17,23,0.9)", backdropFilter:"blur(16px)",
      borderBottom:`1px solid ${BORDER}`,
    }}>
      {children}
    </nav>
  );

  const LogoMark = () => (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        width:28, height:28, borderRadius:6, background:"rgba(110,231,183,0.15)",
        border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, color:ACCENT,
      }}>P</div>
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:14, fontWeight:700, color:TEXT }}>
        Pathway<span style={{ color:ACCENT }}>AI</span>
      </span>
    </div>
  );

  const GhostBtn = ({ onClick, children, style={} }) => (
    <button onClick={onClick} className="chip-btn" style={{
      padding:"7px 16px", borderRadius:6,
      border:`1px solid rgba(110,231,183,0.2)`,
      background:"transparent", color:MUTED, cursor:"pointer",
      fontSize:12, fontWeight:600, fontFamily:"inherit",
      ...style,
    }}>{children}</button>
  );

  const PrimaryBtn = ({ onClick, children, disabled=false, style={} }) => (
    <button onClick={onClick} disabled={disabled} className="chip-btn" style={{
      padding:"11px 28px", borderRadius:6, border:"none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled
        ? "rgba(110,231,183,0.08)"
        : `linear-gradient(135deg,${ACCENT},${ACCENT2})`,
      color: disabled ? MUTED : "#0D1117",
      fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, letterSpacing:"0.06em",
      textTransform:"uppercase",
      boxShadow: disabled ? "none" : "0 0 24px rgba(110,231,183,0.3)",
      transition:"all 0.2s", opacity: disabled ? 0.4 : 1,
      ...style,
    }}>{children}</button>
  );

  /* ══════════════════════════════
     WIZARD SCREEN
  ══════════════════════════════ */
  if (screen === "wizard") {
    const s = STEPS[step];

    return (
      <Wrap>
        <Nav>
          <LogoMark />
          <GhostBtn onClick={() => navigate("/student/dashboard")} style={{ marginLeft:8 }}>
            &larr; Back
          </GhostBtn>
          <div style={{ flex:1 }} />
          <span style={{
            fontFamily:"'Space Mono',monospace", fontSize:11, color:MUTED,
            letterSpacing:"0.08em",
          }}>
            STEP {step+1} / {STEPS.length}
          </span>
        </Nav>

        <div style={{ maxWidth:600, margin:"0 auto", padding:"48px 24px 80px", position:"relative", zIndex:1 }}>

          {/* Hero */}
          <div className="fade-up" style={{ marginBottom:44 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"4px 12px", borderRadius:4, marginBottom:18,
              background:"rgba(110,231,183,0.08)", border:`1px solid ${BORDER}`,
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:ACCENT, animation:"dot-pulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:ACCENT, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                AI-POWERED LEARNING
              </span>
            </div>
            <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:700, lineHeight:1.1, marginBottom:10 }}>
              Build your<br />
              <span className="mint-text">study roadmap.</span>
            </h1>
            <p style={{ fontSize:14, color:MUTED, lineHeight:1.65 }}>
              Answer 5 questions. Get a personalised 7-day plan with book recommendations — powered by Llama on Groq.
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom:36, display:"flex", gap:4 }}>
            {STEPS.map((_,i) => (
              <div key={i} style={{
                flex:1, height:3, borderRadius:2, overflow:"hidden",
                background:"rgba(110,231,183,0.08)",
              }}>
                <div style={{
                  height:"100%", borderRadius:2,
                  background: i < step ? ACCENT : i === step ? `linear-gradient(90deg,${ACCENT},${ACCENT2})` : "transparent",
                  width: i <= step ? "100%" : "0%",
                  transition: "width 0.5s ease",
                }} />
              </div>
            ))}
          </div>

          {error && (
            <div className="fade-up" style={{
              padding:"12px 16px", borderRadius:8, marginBottom:20,
              background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
              color:"#FCA5A5", fontSize:12, fontFamily:"'Space Mono',monospace",
            }}>ERROR: {error}</div>
          )}

          {/* Question block */}
          <div key={`q-${stepKey}`} className="fade-up" style={{
            background:SURFACE, border:`1px solid ${BORDER}`,
            borderRadius:10, padding:"20px 22px", marginBottom:16,
          }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{
                fontFamily:"'Space Mono',monospace", fontSize:10, fontWeight:700,
                color:ACCENT, letterSpacing:"0.1em", padding:"4px 8px",
                background:"rgba(110,231,183,0.08)", border:`1px solid ${BORDER}`,
                borderRadius:4, flexShrink:0, marginTop:2,
              }}>{s.label}</div>
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:TEXT, lineHeight:1.35, marginBottom:5 }}>
                  <TypewriterText text={s.question} speed={18} />
                </h2>
                <p style={{ fontSize:12, color:MUTED }}>{s.hint}</p>
              </div>
            </div>
          </div>

          {/* Answer area */}
          <div key={`a-${stepKey}`} className="fade-up" style={{
            background:SURFACE, border:`1px solid ${BORDER}`,
            borderRadius:10, padding:"20px 22px", marginBottom:20,
            animationDelay:"0.1s",
          }}>

            {/* SUBJECTS */}
            {s.id === "subjects" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {SUBJECTS_LIST.map((sub,i) => {
                  const sel = subjects.includes(sub);
                  return (
                    <button key={sub} className="chip-btn" onClick={() => setSubjects(p => p.includes(sub) ? p.filter(x=>x!==sub) : [...p,sub])} style={{
                      padding:"7px 14px", borderRadius:6, fontSize:12, fontWeight:600, fontFamily:"inherit",
                      background: sel ? "rgba(110,231,183,0.12)" : "rgba(110,231,183,0.03)",
                      border:`1px solid ${sel ? ACCENT : "rgba(110,231,183,0.12)"}`,
                      color: sel ? ACCENT : MUTED,
                      boxShadow: sel ? "0 0 10px rgba(110,231,183,0.12)" : "none",
                    }}>
                      {sel ? "- " : "+ "}{sub}
                    </button>
                  );
                })}
              </div>
            )}

            {/* GOAL */}
            {s.id === "goal" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                {GOALS.map(g => (
                  <button key={g.id} className="chip-btn" onClick={() => setGoal(goal?.id===g.id ? null : g)} style={{
                    padding:"12px 14px", borderRadius:8, fontFamily:"inherit", textAlign:"left",
                    border:`1px solid ${goal?.id===g.id ? ACCENT : "rgba(110,231,183,0.12)"}`,
                    background: goal?.id===g.id ? "rgba(110,231,183,0.1)" : "transparent",
                    color: goal?.id===g.id ? ACCENT : MUTED,
                    fontWeight:600, fontSize:13, cursor:"pointer",
                    boxShadow: goal?.id===g.id ? "0 0 12px rgba(110,231,183,0.1)" : "none",
                  }}>
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* HOURS */}
            {s.id === "hours" && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {HOURS_OPTIONS.map(h => (
                  <button key={h} className="chip-btn" onClick={() => setHours(h)} style={{
                    padding:"12px 22px", borderRadius:6, fontFamily:"'Space Mono',monospace",
                    fontWeight:700, fontSize:16, cursor:"pointer",
                    border:`1px solid ${hours===h ? ACCENT : "rgba(110,231,183,0.12)"}`,
                    background: hours===h ? "rgba(110,231,183,0.1)" : "transparent",
                    color: hours===h ? ACCENT : MUTED,
                    boxShadow: hours===h ? "0 0 12px rgba(110,231,183,0.15)" : "none",
                  }}>{h}h</button>
                ))}
              </div>
            )}

            {/* EXAM DATE */}
            {s.id === "exam" && (
              <div>
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width:"100%", padding:"11px 14px", borderRadius:8, fontSize:14,
                    fontFamily:"'Space Mono',monospace", outline:"none",
                    background: SURFACE2, border:`1px solid ${BORDER}`,
                    color:TEXT, colorScheme:"dark",
                  }}
                />
                <p style={{ marginTop:8, fontSize:11, color:MUTED }}>Leave blank to skip.</p>
              </div>
            )}

            {/* NOTE */}
            {s.id === "note" && (
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                placeholder="e.g. Weak in Trigonometry, best in mornings, prefer visual learning…"
                style={{
                  width:"100%", padding:"12px 14px", borderRadius:8, fontSize:13,
                  fontFamily:"inherit", outline:"none", resize:"vertical",
                  background: SURFACE2, border:`1px solid ${BORDER}`,
                  color:TEXT,
                }}
              />
            )}
          </div>

          {/* Nav buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <GhostBtn onClick={back} style={{ visibility: step===0 ? "hidden" : "visible" }}>
              &larr; Back
            </GhostBtn>
            <PrimaryBtn onClick={advance} disabled={!canAdvance()}>
              {step < STEPS.length - 1 ? "Continue" : "Generate Plan"}
            </PrimaryBtn>
          </div>

          {/* Summary of selections */}
          {step > 0 && subjects.length > 0 && (
            <div className="fade-up" style={{
              marginTop:28, padding:"12px 16px", borderRadius:8,
              background:"rgba(110,231,183,0.04)", border:`1px dashed ${BORDER}`,
              display:"flex", flexWrap:"wrap", gap:6, alignItems:"center",
            }}>
              <span style={{ fontSize:10, color:MUTED, fontFamily:"'Space Mono',monospace", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Selections:
              </span>
              {subjects.map((s,i) => <Tag key={s}>{s}</Tag>)}
              {goal && <Tag>{goal.label}</Tag>}
              {hours && step > 2 && <Tag>{hours}h / day</Tag>}
            </div>
          )}
        </div>
      </Wrap>
    );
  }

  /* ══════════════════════════════
     GENERATING SCREEN — real-time stream
  ══════════════════════════════ */
  if (screen === "generating") return (
    <Wrap>
      <Nav>
        <LogoMark />
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:ACCENT, animation:"dot-pulse 1.2s ease-in-out infinite" }} />
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:ACCENT, letterSpacing:"0.1em" }}>
            {streamDone ? "COMPLETE" : "GENERATING"}
          </span>
        </div>
      </Nav>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"40px 24px 80px", position:"relative", zIndex:1 }}>

        <div className="fade-up" style={{ marginBottom:28 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding:"4px 12px", borderRadius:4, marginBottom:16,
            background:"rgba(110,231,183,0.08)", border:`1px solid ${BORDER}`,
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:ACCENT, animation:"dot-pulse 1s ease-in-out infinite" }} />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:ACCENT, letterSpacing:"0.12em", textTransform:"uppercase" }}>
              AI-POWERED LEARNING — LIVE
            </span>
          </div>
          <h2 style={{ fontSize:26, fontWeight:700, color:TEXT, marginBottom:6 }}>
            Building your <span className="mint-text">roadmap</span>
          </h2>
          <p style={{ fontSize:13, color:MUTED }}>
            Generating a personalised plan for{" "}
            <span style={{ color:ACCENT }}>{subjects.slice(0,3).join(", ")}{subjects.length>3 ? ` +${subjects.length-3} more` : ""}</span>
          </p>
        </div>

        {/* Live stream terminal */}
        <div style={{
          background:SURFACE, border:`1px solid ${BORDER}`,
          borderRadius:10, overflow:"hidden",
        }}>
          {/* Terminal title bar */}
          <div style={{
            padding:"10px 16px", borderBottom:`1px solid ${BORDER}`,
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(110,231,183,0.04)",
          }}>
            <div style={{ display:"flex", gap:5 }}>
              {["#EF4444","#F59E0B","#10B981"].map((c,i) => (
                <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.6 }} />
              ))}
            </div>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:MUTED, letterSpacing:"0.08em" }}>
              llama-3.3-70b-versatile — groq.com
            </span>
            <div style={{ flex:1 }} />
            {streamDone && <Tag>DONE</Tag>}
          </div>

          {/* Stream output */}
          <div style={{ padding:"16px 18px", maxHeight:420, overflowY:"auto", minHeight:120 }}>
            {streamText ? (
              <p className="stream-text">
                {streamText}
                {!streamDone && <span className="stream-cursor" />}
              </p>
            ) : (
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width:10, height:10, borderRadius:"50%",
                    background:ACCENT, opacity:0.4,
                    animation:`dot-pulse 1.2s ${i*0.15}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {streamDone && (
          <p className="fade-up" style={{ textAlign:"center", marginTop:20, fontSize:12, color:ACCENT, fontFamily:"'Space Mono',monospace" }}>
            Plan complete — loading roadmap...
          </p>
        )}
      </div>
    </Wrap>
  );

  /* ══════════════════════════════
     ROADMAP SCREEN
  ══════════════════════════════ */
  if (screen === "roadmap" && plan) return (
    <Wrap>
      <Nav>
        <LogoMark />
        <GhostBtn onClick={() => { setScreen("wizard"); setStep(0); setPlan(null); }} style={{ marginLeft:8 }}>
          &larr; Redo
        </GhostBtn>
        <div style={{ flex:1 }} />
        <GhostBtn onClick={() => window.print()}>Save</GhostBtn>
      </Nav>

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"32px 24px 80px", position:"relative", zIndex:1 }}>

        {/* Summary banner */}
        <div className="fade-up" style={{
          background:SURFACE, border:`1px solid ${BORDER}`,
          borderRadius:10, padding:"22px 24px", marginBottom:20,
          display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start",
        }}>
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:ACCENT }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:ACCENT, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Weekly Strategy
              </span>
            </div>
            <h2 style={{ fontSize:20, fontWeight:700, color:TEXT, marginBottom:8 }}>
              {plan.title || "Your Study Roadmap"}
            </h2>
            <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, marginBottom:12 }}>{plan.summary}</p>
            {plan.weeklyGoal && (
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8, padding:"7px 14px",
                borderRadius:6, background:"rgba(110,231,183,0.07)", border:`1px solid ${BORDER}`,
              }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:ACCENT }}>TARGET: {plan.weeklyGoal}</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, maxWidth:320, alignContent:"flex-start" }}>
            {subjects.map((s,i) => <Tag key={s}>{s}</Tag>)}
            {goal && <Tag>{goal.label}</Tag>}
            <Tag>{hours}h / day</Tag>
          </div>
        </div>

        {/* Milestones */}
        {plan.milestones.length > 0 && (
          <div className="fade-up" style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {plan.milestones.map((ms,i) => (
              <div key={i} style={{
                flex:1, minWidth:200, padding:"14px 16px", borderRadius:8,
                background:SURFACE, border:`1px solid ${BORDER}`,
                display:"flex", gap:12, alignItems:"flex-start",
              }}>
                <Tag>{i===0 ? "MID-WEEK" : "END-WEEK"}</Tag>
                <p style={{ fontSize:12, color:MUTED, lineHeight:1.55 }}>{ms}</p>
              </div>
            ))}
          </div>
        )}

        {/* 7-Day grid */}
        <div className="fade-up">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:3, height:18, background:`linear-gradient(to bottom,${ACCENT},transparent)`, borderRadius:2 }} />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:TEXT, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              7-Day Roadmap
            </span>
            <span style={{ fontSize:11, color:MUTED }}>— click any session to expand</span>
          </div>

          <div style={{ overflowX:"auto", paddingBottom:12 }}>
            <div style={{ display:"flex", gap:10, minWidth:"max-content", padding:"2px 2px 8px" }}>
              {DAYS.map((day,di) => (
                <div key={day} className="card-in" style={{ animationDelay:`${di*0.05}s` }}>
                  <DayCol day={day} data={plan.days[day] || { sessions:[], isRest:di===6 }} di={di} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        {plan.tips.length > 0 && (
          <div className="fade-up" style={{
            background:SURFACE, border:`1px solid ${BORDER}`,
            borderRadius:10, padding:"20px 22px", marginTop:20, marginBottom:20,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:3, height:16, background:`linear-gradient(to bottom,${ACCENT},transparent)`, borderRadius:2 }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:TEXT, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Study Tips
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
              {plan.tips.map((tip,i) => (
                <div key={i} style={{
                  padding:"12px 14px", borderRadius:8,
                  background:"rgba(110,231,183,0.04)", border:`1px solid ${BORDER}`,
                  display:"flex", gap:10, alignItems:"flex-start",
                }}>
                  <span style={{ color:ACCENT, fontSize:10, marginTop:4, fontFamily:"'Space Mono',monospace", flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                  <p style={{ fontSize:12, color:MUTED, lineHeight:1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Books */}
        {plan.books.length > 0 && (
          <div className="fade-up">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:3, height:18, background:`linear-gradient(to bottom,${ACCENT},transparent)`, borderRadius:2 }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:TEXT, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Recommended Books
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
              {plan.books.map((book,i) => <BookCard key={i} book={book} idx={i} />)}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:"center", marginTop:40, display:"flex", gap:12, justifyContent:"center" }}>
          <PrimaryBtn onClick={() => { setScreen("wizard"); setStep(0); setPlan(null); }}>
            Regenerate Plan
          </PrimaryBtn>
          <GhostBtn onClick={() => window.print()}>Print / Save</GhostBtn>
        </div>

      </div>
    </Wrap>
  );

  return null;
}
