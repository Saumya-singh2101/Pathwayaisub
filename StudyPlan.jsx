/**
 * StudyPlan.jsx — PathwayAI Study Roadmap (Conversational Wizard + Books Edition)
 * src/pages/student/StudyPlan.jsx
 *
 * Features:
 *  - Animated conversational Q&A wizard (5 steps, one question at a time)
 *  - Claude API (claude-sonnet-4-20250514) for plan + book recommendations
 *  - Plain-text parser (zero JSON parse errors)
 *  - Animated mindmap roadmap output
 *  - Book recommendations section with cover colours & ratings
 *  - Dark / light theme, mobile-friendly
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

/* ─── Constants ─────────────────────────────────────────────────── */
const SUBJECTS_LIST = [
  "Mathematics","Physics","Chemistry","Biology",
  "History","Geography","Political Science","Economics",
  "English","Hindi","Computer Science","Coding / Programming",
  "General Knowledge","Reasoning & Aptitude",
];

const GOALS = [
  { id:"board",        label:"Board Exams",       icon:"🎓" },
  { id:"jee",          label:"JEE / NEET",         icon:"⚗️" },
  { id:"competitive",  label:"Competitive Exams",  icon:"🏆" },
  { id:"college",      label:"College Assignments",icon:"📚" },
  { id:"skill",        label:"Skill Building",     icon:"⚡" },
  { id:"interview",    label:"Interview Prep",     icon:"💼" },
];

const HOURS_OPTIONS = ["1","2","3","4","5","6+"];
const DAYS     = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DAY_EMOJI = ["🌅","📖","💡","🧠","🔥","⭐","😴"];

const PALETTES = [
  { bg:"#6366F1", soft:"#EEF2FF", glow:"rgba(99,102,241,0.35)"   },
  { bg:"#8B5CF6", soft:"#F5F3FF", glow:"rgba(139,92,246,0.35)"   },
  { bg:"#0EA5E9", soft:"#F0F9FF", glow:"rgba(14,165,233,0.35)"   },
  { bg:"#10B981", soft:"#ECFDF5", glow:"rgba(16,185,129,0.35)"   },
  { bg:"#F59E0B", soft:"#FFFBEB", glow:"rgba(245,158,11,0.35)"   },
  { bg:"#EF4444", soft:"#FEF2F2", glow:"rgba(239,68,68,0.35)"    },
  { bg:"#EC4899", soft:"#FDF2F8", glow:"rgba(236,72,153,0.35)"   },
  { bg:"#84CC16", soft:"#F7FEE7", glow:"rgba(132,204,22,0.35)"   },
];
const pal = (i) => PALETTES[i % PALETTES.length];

const BOOK_COVERS = [
  "#6366F1","#8B5CF6","#0EA5E9","#10B981",
  "#F59E0B","#EF4444","#EC4899","#84CC16",
  "#14B8A6","#F97316","#A855F7","#3B82F6",
];

/* ─── Global CSS ──────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Bricolage+Grotesque:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Bricolage Grotesque', sans-serif; }

  /* Fade / slide in */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes floaty {
    0%,100% { transform: translateY(0px) rotate(-2deg); }
    50%      { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); opacity: 0.7; }
    50%      { transform: scale(1.35); opacity: 1; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes typing {
    from { width: 0; } to { width: 100%; }
  }
  @keyframes blink {
    0%,100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes orb {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-20px) scale(1.1); }
    66%      { transform: translate(-20px,15px) scale(0.95); }
  }
  @keyframes bookPop {
    0%   { opacity:0; transform: scale(0.7) rotate(-5deg); }
    80%  { transform: scale(1.05) rotate(1deg); }
    100% { opacity:1; transform: scale(1) rotate(0deg); }
  }
  @keyframes progressBar {
    from { width: 0; }
    to   { width: var(--target-width); }
  }

  .fade { animation: fadeUp 0.5s ease both; }
  .d1 { animation-delay: 0.06s; }
  .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.18s; }
  .d4 { animation-delay: 0.24s; }
  .d5 { animation-delay: 0.30s; }
  .d6 { animation-delay: 0.36s; }
  .d7 { animation-delay: 0.42s; }

  .shimmer-text {
    background: linear-gradient(90deg,#6366F1,#a78bfa,#38bdf8,#6366F1);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .chip { cursor: pointer; transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
  .chip:hover { transform: translateY(-2px) scale(1.04); }
  .chip:active { transform: scale(0.97); }

  .book-card { 
    animation: bookPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .book-card:hover { transform: translateY(-6px) rotate(1deg); }

  .question-bubble {
    animation: slideInLeft 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .answer-area {
    animation: slideInRight 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
    animation-delay: 0.15s;
  }

  .wizard-dot {
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: orb 8s ease-in-out infinite;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
  }
`;

/* ─── Plain-text parser ─────────────────────────────────────────── */
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
  const flushBook = () => {
    if (curBook) { plan.books.push(curBook); curBook = null; }
  };

  for (const line of lines) {
    if (line.startsWith("TITLE:"))     { plan.title     = line.slice(6).trim();    continue; }
    if (line.startsWith("SUMMARY:"))   { plan.summary    = line.slice(8).trim();   continue; }
    if (line.startsWith("GOAL:"))      { plan.weeklyGoal = line.slice(5).trim();   continue; }
    if (line.startsWith("TIP:"))       { plan.tips.push(line.slice(4).trim());     continue; }
    if (line.startsWith("MILESTONE:")) { plan.milestones.push(line.slice(10).trim()); continue; }

    if (line.startsWith("BOOK:")) {
      flushSess(); flushBook();
      curBook = { title: line.slice(5).trim(), author:"", why:"", rating:5 };
      continue;
    }
    if (line.startsWith("AUTHOR:") && curBook)  { curBook.author = line.slice(7).trim(); continue; }
    if (line.startsWith("WHY:") && curBook)      { curBook.why    = line.slice(4).trim(); continue; }
    if (line.startsWith("RATING:") && curBook)   { curBook.rating = parseFloat(line.slice(7)) || 5; continue; }

    if (line.startsWith("DAY:")) {
      flushSess(); flushBook();
      curDay = line.slice(4).trim();
      if (!plan.days[curDay]) plan.days[curDay] = { sessions:[], isRest: curDay === "Sunday" };
      continue;
    }
    if (/^REST/i.test(line) && curDay) { plan.days[curDay].isRest = true; continue; }

if (line.startsWith("SUBJECT:") && curDay) {
  flushSess();

  const hoursM = line.match(/HOURS:\s*([\d.]+)/i);
  const subj = line
    .replace(/HOURS:[\d.\s]+/i, "")
    .replace("SUBJECT:", "")
    .replace(/\|/g, "")
    .trim();

  curSess = {
    subject: subj,
    hours: hoursM ? parseFloat(hoursM[1]) : 1,
    topic: "",
    tasks: []
  };

  continue;
}

if (line.startsWith("TOPIC:") && curDay) {
  if (!curSess) {
    curSess = {
      subject: "Study",
      hours: 1,
      topic: "",
      tasks: []
    };
  }

  curSess.topic = line.slice(6).trim();
  continue;
}

if (line.startsWith("TASK:") && curSess) {
  curSess.tasks.push(line.slice(5).trim());
  continue;
}

if (line.startsWith("TASKS:") && curSess) {
  curSess.tasks = line
    .slice(6)
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
  continue;
}
  }
  flushSess(); 

  for (const d of DAYS) {
    if (!plan.days[d]) plan.days[d] = { sessions:[], isRest: d === "Sunday" };
  }
  return plan;
}

/* ─── SessionNode ────────────────────────────────────────────────── */
function SessionNode({ sess, subjIdx, dark }) {
  const [open, setOpen] = useState(false);
  const p = pal(subjIdx);
  return (
    <div onClick={() => setOpen(!open)} style={{
      cursor:"pointer", borderRadius:12, padding:"9px 12px",
      background: dark ? `${p.bg}16` : p.soft,
      border:`1.5px solid ${dark ? `${p.bg}40` : `${p.bg}35`}`,
      transition:"box-shadow 0.2s, transform 0.15s",
      boxShadow: open ? `0 4px 18px ${p.glow}` : "none",
      transform: open ? "scale(1.01)" : "scale(1)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:p.bg, flexShrink:0, boxShadow:`0 0 5px ${p.glow}` }} />
        <span style={{ fontSize:11, fontWeight:800, color:p.bg, fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em", flex:1 }}>
          {sess.subject}
        </span>
        <span style={{ fontSize:10, color: dark?"#475569":"#94A3B8", fontWeight:600 }}>{sess.hours}h</span>
        <span style={{ fontSize:10, color: dark?"#334155":"#CBD5E1", transition:"transform 0.2s", display:"inline-block", transform: open?"rotate(180deg)":"none" }}>▾</span>
      </div>
      {sess.topic && (
        <p style={{ fontSize:12, fontWeight:700, color: dark?"#E2EEFF":"#1E293B", margin:"4px 0 0 12px", lineHeight:1.35 }}>
          {sess.topic}
        </p>
      )}
      {open && sess.tasks.length > 0 && (
        <div style={{ marginTop:7, paddingLeft:12, display:"flex", flexDirection:"column", gap:4 }}>
          {sess.tasks.map((tk, i) => (
            <div key={i} style={{ display:"flex", gap:5, alignItems:"flex-start" }}>
              <span style={{ color:p.bg, fontSize:8, marginTop:5, flexShrink:0 }}>◆</span>
              <span style={{ fontSize:11, color: dark?"#94A3B8":"#64748B", lineHeight:1.5 }}>{tk}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── DayCol ──────────────────────────────────────────────────────── */
function DayCol({ day, data, di, dark, allSubjects }) {
  const isRest = data.isRest || data.sessions.length === 0;
  const totalH = data.sessions.reduce((s,x) => s+(x.hours||1), 0);
  const colPal = pal(di);

  return (
    <div style={{ display:"flex", flexDirection:"column", width:200, flexShrink:0 }}>
      <div style={{
        borderRadius:14, padding:"12px 10px", textAlign:"center", marginBottom:12,
        background: isRest
          ? (dark?"rgba(30,41,59,0.5)":"rgba(241,245,249,0.7)")
          : (dark?`${colPal.bg}18`:colPal.soft),
        border:`2px solid ${isRest
          ? (dark?"rgba(71,85,105,0.3)":"rgba(203,213,225,0.5)")
          : `${colPal.bg}50`}`,
        position:"relative",
      }}>
        <div style={{ fontSize:20, marginBottom:2 }}>{DAY_EMOJI[di]}</div>
        <div style={{
          fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:900,
          letterSpacing:"0.12em", textTransform:"uppercase",
          color: isRest ? (dark?"#475569":"#94A3B8") : colPal.bg,
        }}>{DAY_SHORT[di]}</div>
        <div style={{ fontSize:10, color: dark?"#475569":"#94A3B8", marginTop:2, fontWeight:600 }}>
          {isRest ? "Rest Day" : `${totalH}h`}
        </div>
        {!isRest && (
          <div style={{
            position:"absolute", bottom:-7, left:"50%", transform:"translateX(-50%)",
            width:11, height:11, borderRadius:"50%",
            background:colPal.bg, boxShadow:`0 0 8px ${colPal.glow}`,
            border:`2px solid ${dark?"#070E1C":"#F0F4FF"}`,
          }} />
        )}
      </div>
      {!isRest && data.sessions.length > 0 ? (
        <div style={{ position:"relative", paddingLeft:4 }}>
          <div style={{
            position:"absolute", left:7, top:0, bottom:16, width:2,
            background:`linear-gradient(to bottom,${colPal.bg}70,transparent)`,
            borderRadius:2,
          }} />
          <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:18 }}>
            {data.sessions.map((sess, si) => {
              const idx = allSubjects.indexOf(sess.subject);
              return (
                <div key={si} style={{ position:"relative" }}>
                  <div style={{
                    position:"absolute", left:-18, top:"50%", width:16, height:2,
                    background:`${pal(idx>=0?idx:si).bg}50`,
                  }} />
                  <SessionNode sess={sess} subjIdx={idx>=0?idx:si} dark={dark} />
                </div>
              );
            })}
          </div>
        </div>
      ) : isRest ? (
        <div style={{ textAlign:"center", padding:"16px 8px", color: dark?"#334155":"#CBD5E1", fontSize:12, fontStyle:"italic" }}>
          Rest & light review 🧘
        </div>
      ) : null}
    </div>
  );
}

/* ─── BookCard ────────────────────────────────────────────────────── */
function BookCard({ book, idx, dark }) {
  const coverColor = BOOK_COVERS[idx % BOOK_COVERS.length];
  const t = dark ? "#E2EEFF" : "#0F172A";
  const mu = dark ? "#64748B" : "#94A3B8";
  const stars = Math.round(Math.min(5, Math.max(1, book.rating)));

  return (
    <div className="book-card" style={{
      animationDelay: `${idx * 0.07}s`,
      display:"flex", gap:14, padding:"16px 18px", borderRadius:16,
      background: dark ? "rgba(13,27,46,0.85)" : "rgba(255,255,255,0.95)",
      border: `1px solid ${dark?"rgba(99,102,241,0.15)":"rgba(165,180,252,0.35)"}`,
      boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(99,102,241,0.08)",
    }}>
      {/* Spine */}
      <div style={{
        width:46, minHeight:64, borderRadius:6, flexShrink:0,
        background:`linear-gradient(160deg,${coverColor},${coverColor}bb)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, boxShadow:`3px 3px 12px ${coverColor}55`,
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", left:0, top:0, bottom:0, width:6,
          background:"rgba(0,0,0,0.18)",
        }} />
        📖
      </div>
      {/* Info */}
      <div style={{ flex:1 }}>
        <p style={{ fontSize:14, fontWeight:700, color:t, lineHeight:1.3, marginBottom:3 }}>
          {book.title}
        </p>
        {book.author && (
          <p style={{ fontSize:12, color:mu, marginBottom:6 }}>by {book.author}</p>
        )}
        {/* Stars */}
        <div style={{ display:"flex", gap:2, marginBottom:6 }}>
          {Array.from({ length:5 }).map((_,i) => (
            <span key={i} style={{ fontSize:12, color: i < stars ? "#F59E0B" : (dark?"#1E293B":"#E2E8F0") }}>★</span>
          ))}
        </div>
        {book.why && (
          <p style={{ fontSize:12, color:mu, lineHeight:1.5, fontStyle:"italic" }}>
            {book.why}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Wizard Step definitions ─────────────────────────────────────── */
const STEPS = [
  {
    id:"subjects",
    emoji:"📚",
    question:"Which subjects do you want to study?",
    hint:"Pick all that apply — we'll balance them in your plan.",
    type:"multi",
  },
  {
    id:"goal",
    emoji:"🎯",
    question:"What's your main goal right now?",
    hint:"This helps us prioritise the right topics.",
    type:"single",
  },
  {
    id:"hours",
    emoji:"⏱",
    question:"How many hours can you study per day?",
    hint:"Be realistic — consistency beats cramming.",
    type:"single",
  },
  {
    id:"exam",
    emoji:"📅",
    question:"Do you have an exam or deadline coming up?",
    hint:"Optional — leave blank if not applicable.",
    type:"date",
  },
  {
    id:"note",
    emoji:"💬",
    question:"Anything else we should know?",
    hint:"Weak topics, energy levels, special constraints…",
    type:"text",
  },
];

/* ─── TypewriterText ─────────────────────────────────────────────── */
function TypewriterText({ text, speed=28, style={} }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return (
    <span style={style}>
      {displayed}
      {!done && (
        <span style={{ display:"inline-block", width:2, height:"1em", background:"currentColor",
          marginLeft:2, verticalAlign:"text-bottom", animation:"blink 0.7s step-end infinite" }} />
      )}
    </span>
  );
}

/* ─── ProgressDots ───────────────────────────────────────────────── */
function ProgressDots({ current, total, dark }) {
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:32 }}>
      {Array.from({ length: total }).map((_,i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="wizard-dot" style={{
            width: active ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: active
              ? "linear-gradient(90deg,#6366F1,#38BDF8)"
              : done
                ? "#6366F1"
                : (dark?"rgba(99,102,241,0.2)":"rgba(165,180,252,0.4)"),
          }} />
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function StudyPlan() {
  const navigate = useNavigate();
  const { dark, toggleDark } = useApp();

  /* Screen: wizard | generating | roadmap */
  const [screen, setScreen] = useState("wizard");
  const [step, setStep]     = useState(0);

  /* Answers */
  const [subjects, setSubjects] = useState([]);
  const [goal, setGoal]         = useState(null);
  const [hours, setHours]       = useState("2");
  const [examDate, setExamDate] = useState("");
  const [note, setNote]         = useState("");

  const [plan, setPlan]   = useState(null);
  const [error, setError] = useState(null);
  const [stepKey, setStepKey] = useState(0); // force re-animation per step

  const answerAreaRef = useRef(null);

  const t  = dark ? "#E2EEFF" : "#0F172A";
  const mu = dark ? "#64748B" : "#94A3B8";
  const card = {
    background: dark ? "rgba(13,27,46,0.88)" : "rgba(255,255,255,0.92)",
    border: `1px solid ${dark?"rgba(99,102,241,0.18)":"rgba(165,180,252,0.4)"}`,
    backdropFilter:"blur(20px)", borderRadius:22,
  };

  /* ── Advance wizard ── */
  const canAdvance = () => {
    if (step === 0) return subjects.length > 0;
    if (step === 1) return goal !== null;
    if (step === 2) return hours !== "";
    return true; // date and note are optional
  };

  const advance = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      setStepKey(k => k + 1);
    } else {
      generate();
    }
  };

  const back = () => {
    if (step > 0) { setStep(s => s - 1); setStepKey(k => k + 1); }
  };

  /* ── Generate via Claude API ── */
  const generate = async () => {
    setScreen("generating");
    setError(null);
    const daysUntil = examDate ? Math.ceil((new Date(examDate) - new Date()) / 86400000) : null;

    const prompt = `You are a world-class academic study planner. Output ONLY a 7-day study plan AND book recommendations in the EXACT format below. No JSON. No markdown. No asterisks. No extra text.

TITLE: [Short motivating title, max 8 words]
SUMMARY: [2 sentences on the weekly strategy]
GOAL: [One sentence on what the student achieves this week]

DAY: Monday
SUBJECT: [subject name] | HOURS: [number like 1.5]
TOPIC: [specific topic for this session]
TASKS: [task 1], [task 2], [task 3]
SUBJECT: [optional 2nd subject] | HOURS: [number]
TOPIC: [specific topic]
TASKS: [task 1], [task 2]

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
WHY: [One sentence why this book helps for the subjects/goal]
RATING: [rating from 1-5 as a number]

BOOK: [Book title 2]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [rating]

BOOK: [Book title 3]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [rating]

BOOK: [Book title 4]
AUTHOR: [Author name]
WHY: [One sentence why]
RATING: [rating]

===
Student details:
Subjects: ${subjects.join(", ")}
Hours per day: ${hours}
Goal: ${goal?.label || "General improvement"}
Days until exam: ${daysUntil ? daysUntil + " days" : "Not specified"}
Notes: ${note || "None"}
${daysUntil && daysUntil < 14 ? "URGENT: Exam soon — prioritise high-weightage topics and past papers." : ""}

IMPORTANT: Output ONLY from TITLE: to the last BOOK/RATING line. Nothing else. Recommend books that are real, well-known, and genuinely useful for the subject(s) chosen. Include at least 4 books.`;

    try {
      const res = await fetch("http://127.0.0.1:8000/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  subject: subjects.join(", "),
  hours: hours
}),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
const raw = data.plan;

console.log("AI OUTPUT:", raw);
      const parsed = parsePlan(raw);
      setPlan(parsed);
      setScreen("roadmap");
    } catch (e) {
      setError("Could not generate plan: " + e.message);
      setScreen("wizard");
      setStep(4);
    }
  };

  /* ─── NAV ─── */
  const Nav = ({ children }) => (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      display:"flex", alignItems:"center", gap:12, padding:"14px 20px",
      background: dark ? "rgba(7,14,28,0.85)" : "rgba(240,244,255,0.85)",
      backdropFilter:"blur(16px)",
      borderBottom:`1px solid ${dark?"rgba(99,102,241,0.1)":"rgba(165,180,252,0.3)"}`,
    }}>
      {children}
      <button onClick={toggleDark} style={{
        marginLeft:"auto", width:40, height:22, borderRadius:11,
        background: dark?"linear-gradient(90deg,#6366F1,#818CF8)":"rgba(203,213,225,0.5)",
        border:"none", cursor:"pointer", position:"relative", flexShrink:0,
        transition:"background 0.3s",
      }}>
        <div style={{
          position:"absolute", top:2, left: dark?20:2, width:18, height:18,
          borderRadius:"50%", background:"white",
          transition:"left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:10,
        }}>{dark?"🌙":"☀️"}</div>
      </button>
    </nav>
  );

  const GhostBtn = ({ onClick, children, style={} }) => (
    <button onClick={onClick} style={{
      padding:"7px 16px", borderRadius:10,
      border:`1px solid ${dark?"rgba(99,102,241,0.25)":"rgba(165,180,252,0.5)"}`,
      background:"transparent", color:mu, cursor:"pointer",
      fontSize:13, fontWeight:700, fontFamily:"inherit",
      transition:"all 0.18s", ...style,
    }}>{children}</button>
  );

  const PrimaryBtn = ({ onClick, children, disabled=false, style={} }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"12px 32px", borderRadius:12, border:"none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled
        ? (dark?"rgba(99,102,241,0.15)":"rgba(199,210,254,0.4)")
        : "linear-gradient(135deg,#6366F1,#818CF8,#38BDF8)",
      color: disabled ? mu : "white",
      fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800,
      boxShadow: disabled ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
      transition:"all 0.2s", opacity: disabled ? 0.5 : 1,
      ...style,
    }}>{children}</button>
  );

  /* ══════════════════════════════
     WIZARD SCREEN
  ══════════════════════════════ */
  if (screen === "wizard") {
    const s = STEPS[step];

    return (
      <div style={{ minHeight:"100vh", background:dark?"#070E1C":"#F0F4FF", color:t, fontFamily:"'Bricolage Grotesque',sans-serif", overflow:"hidden" }}>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        {/* Background orbs */}
        <div style={{ position:"fixed", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
          <div className="orb" style={{ width:400, height:400, background:dark?"rgba(99,102,241,0.07)":"rgba(99,102,241,0.06)", top:"-10%", right:"-5%", animationDelay:"0s" }} />
          <div className="orb" style={{ width:350, height:350, background:dark?"rgba(56,189,248,0.05)":"rgba(56,189,248,0.06)", bottom:"5%", left:"-8%", animationDelay:"3s" }} />
        </div>

        <Nav>
          <GhostBtn onClick={() => navigate("/student/dashboard")}>← Back</GhostBtn>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:900, flex:1, color:t }}>
            🗺 Study Roadmap Builder
          </span>
        </Nav>

        <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px 80px", position:"relative", zIndex:1 }}>

          {/* Hero */}
          <div className="fade" style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:50, marginBottom:10, display:"inline-block", animation:"floaty 3s ease-in-out infinite" }}>🗺</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,5vw,38px)", fontWeight:900, lineHeight:1.1, marginBottom:8 }}>
              <span style={{ color:t }}>Build Your </span>
              <span className="shimmer-text">Study Roadmap</span>
            </h1>
            <p style={{ fontSize:14, color:mu, maxWidth:380, margin:"0 auto", lineHeight:1.65 }}>
              Answer 5 quick questions — our AI will craft a personalised 7-day plan with book recommendations.
            </p>
          </div>

          {/* Progress */}
          <ProgressDots current={step} total={STEPS.length} dark={dark} />

          {error && (
            <div className="fade" style={{
              padding:"12px 16px", borderRadius:12, marginBottom:16,
              background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
              color:"#F87171", fontSize:13,
            }}>⚠️ {error}</div>
          )}

          {/* Question bubble */}
          <div key={`q-${stepKey}`} className="question-bubble" style={{ ...card, padding:"22px 24px", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{
                width:42, height:42, borderRadius:12, flexShrink:0,
                background:"linear-gradient(135deg,#6366F1,#818CF8)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                boxShadow:"0 4px 14px rgba(99,102,241,0.4)",
              }}>{s.emoji}</div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:"#818CF8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>
                  Question {step + 1} of {STEPS.length}
                </p>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:t, lineHeight:1.3, marginBottom:6 }}>
                  <TypewriterText text={s.question} speed={22} />
                </h2>
                <p style={{ fontSize:13, color:mu }}>{s.hint}</p>
              </div>
            </div>
          </div>

          {/* Answer area */}
          <div key={`a-${stepKey}`} className="answer-area" style={{ ...card, padding:"22px 24px", marginBottom:20 }}>

            {/* SUBJECTS (multi-select chips) */}
            {s.type === "multi" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {SUBJECTS_LIST.map((sub, i) => {
                  const p = pal(i);
                  const sel = subjects.includes(sub);
                  return (
                    <button key={sub} className="chip" onClick={() => setSubjects(prev => prev.includes(sub) ? prev.filter(x=>x!==sub) : [...prev, sub])} style={{
                      padding:"8px 16px", borderRadius:20, fontSize:13, fontWeight:700, fontFamily:"inherit",
                      background: sel ? (dark?`${p.bg}22`:p.soft) : (dark?"rgba(15,30,55,0.7)":"rgba(241,245,249,0.9)"),
                      border:`2px solid ${sel ? p.bg : "transparent"}`,
                      color: sel ? p.bg : mu,
                      boxShadow: sel ? `0 0 10px ${p.glow}` : "none",
                    }}>
                      {sel ? "✓ " : ""}{sub}
                    </button>
                  );
                })}
              </div>
            )}

            {/* GOAL (single select) */}
            {s.id === "goal" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {GOALS.map(g => (
                  <button key={g.id} className="chip" onClick={() => setGoal(goal?.id===g.id ? null : g)} style={{
                    padding:"13px 12px", borderRadius:13, fontFamily:"inherit", textAlign:"left",
                    border:`2px solid ${goal?.id===g.id ? "#818CF8" : (dark?"rgba(99,102,241,0.15)":"rgba(165,180,252,0.3)")}`,
                    background: goal?.id===g.id ? (dark?"rgba(129,140,248,0.15)":"rgba(238,242,255,0.8)") : "transparent",
                    color: goal?.id===g.id ? "#818CF8" : mu, fontWeight:700, fontSize:13,
                    display:"flex", alignItems:"center", gap:10,
                  }}>
                    <span style={{ fontSize:22 }}>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* HOURS */}
            {s.id === "hours" && (
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {HOURS_OPTIONS.map(h => (
                  <button key={h} className="chip" onClick={() => setHours(h)} style={{
                    padding:"12px 22px", borderRadius:12, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16,
                    border:`2px solid ${hours===h ? "#818CF8" : "transparent"}`,
                    background: hours===h ? (dark?"rgba(129,140,248,0.15)":"rgba(238,242,255,0.8)") : (dark?"rgba(15,30,55,0.7)":"rgba(241,245,249,0.9)"),
                    color: hours===h ? "#818CF8" : mu,
                    boxShadow: hours===h ? "0 0 12px rgba(129,140,248,0.35)" : "none",
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
                    width:"100%", padding:"12px 16px", borderRadius:12, fontSize:15,
                    fontFamily:"inherit", outline:"none",
                    background: dark?"rgba(15,30,55,0.8)":"rgba(248,250,252,0.9)",
                    border:`1.5px solid ${dark?"rgba(99,102,241,0.25)":"rgba(165,180,252,0.5)"}`,
                    color:t, colorScheme:dark?"dark":"light",
                  }}
                />
                <p style={{ marginTop:10, fontSize:12, color:mu }}>Leave blank to skip — your plan will be built for general study.</p>
              </div>
            )}

            {/* NOTE */}
            {s.id === "note" && (
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                placeholder="e.g. Weak in Trigonometry, best in mornings, tuition on Wednesday evenings, prefer visual learning…"
                style={{
                  width:"100%", padding:"12px 16px", borderRadius:12, fontSize:14,
                  fontFamily:"inherit", outline:"none", resize:"vertical",
                  background: dark?"rgba(15,30,55,0.8)":"rgba(248,250,252,0.9)",
                  border:`1.5px solid ${dark?"rgba(99,102,241,0.25)":"rgba(165,180,252,0.5)"}`,
                  color:t,
                }}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div style={{ display:"flex", gap:10, justifyContent:"space-between", alignItems:"center" }}>
            <GhostBtn onClick={back} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
              ← Back
            </GhostBtn>

            <PrimaryBtn onClick={advance} disabled={!canAdvance()}>
              {step < STEPS.length - 1
                ? `Next →`
                : "🤖 Generate My Plan →"
              }
            </PrimaryBtn>
          </div>

          {/* Mini summary of selections so far */}
          {step > 0 && (
            <div className="fade" style={{
              marginTop:28, padding:"14px 18px", borderRadius:14,
              background: dark?"rgba(99,102,241,0.06)":"rgba(238,242,255,0.7)",
              border:`1px dashed ${dark?"rgba(99,102,241,0.2)":"rgba(165,180,252,0.5)"}`,
              display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
            }}>
              <span style={{ fontSize:11, fontWeight:700, color:mu, textTransform:"uppercase", letterSpacing:"0.06em" }}>Your answers so far:</span>
              {subjects.length > 0 && subjects.map((s,i) => (
                <span key={s} style={{ padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:pal(i).soft, color:pal(i).bg, border:`1px solid ${pal(i).bg}40` }}>{s}</span>
              ))}
              {goal && <span style={{ padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(129,140,248,0.12)", color:"#818CF8", border:"1px solid rgba(129,140,248,0.3)" }}>{goal.icon} {goal.label}</span>}
              {hours && step > 2 && <span style={{ padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700, background:"rgba(16,185,129,0.1)", color:"#10B981", border:"1px solid rgba(16,185,129,0.3)" }}>{hours}h/day</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════
     GENERATING SCREEN
  ══════════════════════════════ */
  if (screen === "generating") return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background: dark?"#070E1C":"#F0F4FF", fontFamily:"'Bricolage Grotesque',sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="orb" style={{ width:500, height:500, background:dark?"rgba(99,102,241,0.07)":"rgba(99,102,241,0.07)", top:"20%", left:"20%" }} />
      <div style={{ textAlign:"center", padding:40, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:60, marginBottom:20, display:"inline-block", animation:"floaty 2s ease-in-out infinite" }}>🗺</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:900, color:t, marginBottom:8 }}>
          Crafting your roadmap…
        </h2>
        <p style={{ color:mu, fontSize:14, marginBottom:10, maxWidth:360, margin:"0 auto 10px" }}>
          Building a personalised plan for{" "}
          <strong style={{ color:t }}>{subjects.slice(0,3).join(", ")}{subjects.length>3?` +${subjects.length-3} more`:""}</strong>
        </p>
        <p style={{ color:mu, fontSize:13, marginBottom:32, maxWidth:300, margin:"0 auto 32px" }}>
          Plus book recommendations for your subjects…
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width:13, height:13, borderRadius:"50%",
              background: pal(i).bg,
              animation:`pulse 1.4s ${i*0.18}s ease-in-out infinite`,
              boxShadow:`0 0 8px ${pal(i).glow}`,
            }} />
          ))}
        </div>
        <p style={{ fontSize:12, color:dark?"#334155":"#CBD5E1", marginTop:24, fontStyle:"italic" }}>
          Usually takes 10–20 seconds…
        </p>
      </div>
    </div>
  );

  /* ══════════════════════════════
     ROADMAP SCREEN
  ══════════════════════════════ */
  if (screen === "roadmap" && plan) return (
    <div style={{ minHeight:"100vh", background:dark?"#070E1C":"#F0F4FF", fontFamily:"'Bricolage Grotesque',sans-serif", color:t }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <Nav>
        <GhostBtn onClick={() => { setScreen("wizard"); setStep(0); setPlan(null); }}>← Redo</GhostBtn>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:900, flex:1, color:t }}>
          🗺 {plan.title || "Your Study Roadmap"}
        </span>
        <GhostBtn onClick={() => window.print()}>⬇ Save</GhostBtn>
      </Nav>

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 20px 80px" }}>

        {/* ── Summary Banner ── */}
        <div className="fade" style={{
          borderRadius:22, padding:"26px 28px", marginBottom:24,
          background: dark
            ? "linear-gradient(135deg,rgba(99,102,241,0.13),rgba(56,189,248,0.07))"
            : "linear-gradient(135deg,rgba(238,242,255,0.95),rgba(224,242,254,0.95))",
          border:`1px solid ${dark?"rgba(99,102,241,0.22)":"rgba(165,180,252,0.5)"}`,
          display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start",
        }}>
          <div style={{ flex:1, minWidth:260 }}>
            <p style={{ fontSize:11, fontWeight:800, color:"#818CF8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>
              This Week's Strategy
            </p>
            <p style={{ fontSize:15, color:t, lineHeight:1.7, marginBottom:14 }}>{plan.summary}</p>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:10,
              background: dark?"rgba(99,102,241,0.12)":"rgba(238,242,255,0.8)",
              border:`1px solid ${dark?"rgba(99,102,241,0.2)":"rgba(165,180,252,0.4)"}`,
            }}>
              <span>🎯</span>
              <span style={{ fontSize:13, color:"#818CF8", fontWeight:700 }}>{plan.weeklyGoal}</span>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, maxWidth:340, alignContent:"flex-start" }}>
            {subjects.map((s,i) => {
              const p = pal(i);
              return (
                <span key={s} style={{
                  padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700,
                  background:dark?`${p.bg}20`:p.soft, border:`1px solid ${p.bg}45`, color:p.bg,
                }}>{s}</span>
              );
            })}
          </div>
        </div>

        {/* ── Milestones ── */}
        {plan.milestones.length > 0 && (
          <div className="fade d1" style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
            {plan.milestones.map((ms,i) => (
              <div key={i} style={{
                flex:1, minWidth:200, padding:"14px 18px", borderRadius:14,
                background:dark?"rgba(13,27,46,0.85)":"rgba(255,255,255,0.9)",
                border:`1px solid ${dark?"rgba(99,102,241,0.15)":"rgba(165,180,252,0.4)"}`,
                display:"flex", gap:12, alignItems:"flex-start",
              }}>
                <span style={{ fontSize:22 }}>{i===0?"🏃":"🏆"}</span>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, color:mu, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                    Milestone {i+1}
                  </p>
                  <p style={{ fontSize:13, fontWeight:700, color:t }}>{ms}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 7-Day Mindmap ── */}
        <div className="fade d2">
          <h2 style={{
            fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900, color:t,
            marginBottom:18, display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{
              display:"inline-block", width:5, height:22, borderRadius:3,
              background:"linear-gradient(to bottom,#6366F1,#38BDF8)",
            }} />
            7-Day Visual Roadmap
            <span style={{ fontSize:12, fontWeight:600, color:mu, fontFamily:"inherit" }}>
              — tap any block to see tasks
            </span>
          </h2>

          {/* Central hub */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:18 }}>
            <div style={{
              padding:"12px 28px", borderRadius:50,
              background:"linear-gradient(135deg,#6366F1,#818CF8,#38BDF8)",
              boxShadow:"0 4px 28px rgba(99,102,241,0.45)",
              color:"white", fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:14, letterSpacing:"0.06em",
            }}>
              🎓 {goal?.label || "Study Plan"} · {hours}h/day
            </div>
            <div style={{ width:2, height:18, background:"linear-gradient(to bottom,#6366F1,transparent)" }} />
            <div style={{
              width:"88%", height:2,
              background:"linear-gradient(to right,transparent,#6366F166,#6366F1,#6366F166,transparent)",
              marginBottom:16,
            }} />
          </div>

          {/* Day columns */}
          <div style={{ overflowX:"auto", paddingBottom:12 }}>
            <div style={{ display:"flex", gap:12, minWidth:"max-content", padding:"4px 4px 8px", alignItems:"flex-start" }}>
              {DAYS.map((day,di) => (
                <div key={day} className={`fade d${di+1}`}>
                  <DayCol
                    day={day}
                    data={plan.days[day] || { sessions:[], isRest:di===6 }}
                    di={di}
                    dark={dark}
                    allSubjects={subjects}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tips ── */}
        {plan.tips.length > 0 && (
          <div className="fade" style={{
            background:dark?"rgba(13,27,46,0.85)":"rgba(255,255,255,0.9)",
            border:`1px solid ${dark?"rgba(99,102,241,0.15)":"rgba(165,180,252,0.4)"}`,
            borderRadius:20, padding:"22px 24px", marginTop:24, marginBottom:24,
          }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:t, marginBottom:14 }}>💡 Study Tips</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
              {plan.tips.map((tip,i) => (
                <div key={i} style={{
                  padding:"12px 14px", borderRadius:12, display:"flex", gap:10, alignItems:"flex-start",
                  background:dark?`${pal(i).bg}12`:pal(i).soft,
                  border:`1px solid ${pal(i).bg}30`,
                }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{["💡","🔥","⚡","🎯","🧠"][i]||"✨"}</span>
                  <p style={{ fontSize:13, color:mu, lineHeight:1.55 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Book Recommendations ── */}
        {plan.books.length > 0 && (
          <div className="fade">
            <h3 style={{
              fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:900, color:t,
              marginBottom:6, display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{
                display:"inline-block", width:5, height:22, borderRadius:3,
                background:"linear-gradient(to bottom,#F59E0B,#EF4444)",
              }} />
              📚 Recommended Books
            </h3>
            <p style={{ fontSize:13, color:mu, marginBottom:18 }}>
              Handpicked reads to deepen your understanding of {subjects.slice(0,2).join(" & ")}{subjects.length > 2 ? " and more" : ""}.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12 }}>
              {plan.books.map((book,i) => (
                <BookCard key={i} book={book} idx={i} dark={dark} />
              ))}
            </div>
          </div>
        )}

        {/* ── Regenerate CTA ── */}
        <div style={{ textAlign:"center", marginTop:36 }}>
          <PrimaryBtn onClick={() => { setScreen("wizard"); setStep(0); setPlan(null); }} style={{ marginRight:12 }}>
            🔄 Regenerate Plan
          </PrimaryBtn>
          <GhostBtn onClick={() => window.print()}>⬇ Print / Save</GhostBtn>
        </div>

      </div>
    </div>
  );

  return null;
}
