/**
 * Quiz.jsx — PathwayAI Quiz
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

/* ═══════════════════════ QUESTION BANK ═══════════════════════ */
const QUESTION_BANK = {
  math: {
    easy: [
      { question: "What is 15 × 8?", options: ["110", "120", "125", "115"], correctIndex: 1, explanation: "15 × 8 = 120. Break it: 10×8=80 and 5×8=40, then 80+40=120." },
      { question: "What is the square root of 144?", options: ["11", "13", "12", "14"], correctIndex: 2, explanation: "√144 = 12, because 12 × 12 = 144." },
      { question: "What is 25% of 200?", options: ["40", "50", "60", "45"], correctIndex: 1, explanation: "25% = 1/4. So 200 ÷ 4 = 50." },
      { question: "Value of π approximately?", options: ["3.14", "3.41", "3.12", "3.16"], correctIndex: 0, explanation: "π ≈ 3.14159… The standard approximation is 3.14." },
      { question: "Triangle has angles 60° and 80°. Third angle?", options: ["30°", "40°", "50°", "60°"], correctIndex: 1, explanation: "Sum of angles = 180°. Third = 180 - 60 - 80 = 40°." },
      { question: "LCM of 4 and 6?", options: ["8", "12", "16", "24"], correctIndex: 1, explanation: "Multiples of 4: 4,8,12… Multiples of 6: 6,12… LCM = 12." },
      { question: "Solve: 3x = 21", options: ["x = 6", "x = 7", "x = 8", "x = 9"], correctIndex: 1, explanation: "Divide both sides by 3: x = 21/3 = 7." },
      { question: "Area of rectangle 8cm × 5cm?", options: ["30 cm²", "35 cm²", "40 cm²", "45 cm²"], correctIndex: 2, explanation: "Area = length × width = 8 × 5 = 40 cm²." },
    ],
    medium: [
      { question: "Value of 2³ + 3²?", options: ["15", "17", "19", "13"], correctIndex: 1, explanation: "2³=8, 3²=9. Sum = 17." },
      { question: "f(x) = x² - 3x + 2, f(3) = ?", options: ["1", "2", "0", "4"], correctIndex: 1, explanation: "f(3) = 9 - 9 + 2 = 2." },
      { question: "HCF of 36 and 48?", options: ["6", "8", "12", "18"], correctIndex: 2, explanation: "Common factors — highest is 12." },
      { question: "Train: 300 km in 5 hours. Speed?", options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], correctIndex: 2, explanation: "Speed = 300 ÷ 5 = 60 km/h." },
      { question: "Slope of y = 3x - 7?", options: ["−7", "3", "7", "−3"], correctIndex: 1, explanation: "In y = mx + c, m is slope. Slope = 3." },
      { question: "(x² - 4) ÷ (x - 2)?", options: ["x + 2", "x - 2", "x² + 2", "2x"], correctIndex: 0, explanation: "x²-4 = (x+2)(x-2). Cancel (x-2) → x+2." },
      { question: "sin 30°?", options: ["√3/2", "1/2", "1/√2", "√3"], correctIndex: 1, explanation: "sin 30° = 1/2. Memorise key trig values." },
      { question: "P(heads twice, 2 coin tosses)?", options: ["1/2", "1/3", "1/4", "1/8"], correctIndex: 2, explanation: "P(HH) = 1/2 × 1/2 = 1/4." },
    ],
    hard: [
      { question: "Derivative of x³ - 5x² + 6x?", options: ["3x² - 10x + 6", "x² - 5x + 6", "3x² - 5x + 6", "3x - 10x"], correctIndex: 0, explanation: "Power rule: 3x² - 10x + 6." },
      { question: "Sum of 1 + 1/2 + 1/4 + …?", options: ["1.5", "2", "2.5", "3"], correctIndex: 1, explanation: "S = a/(1-r) = 1/(1-0.5) = 2." },
      { question: "log₂(32) = ?", options: ["4", "5", "6", "3"], correctIndex: 1, explanation: "2⁵ = 32, so log₂(32) = 5." },
      { question: "det([[2,1],[3,4]]) = ?", options: ["5", "8", "11", "3"], correctIndex: 0, explanation: "det = (2)(4) - (1)(3) = 8 - 3 = 5." },
    ],
  },
  science: {
    easy: [
      { question: "Chemical formula of water?", options: ["H₂O₂", "HO₂", "H₂O", "H₃O"], correctIndex: 2, explanation: "Water is H₂O — two hydrogen, one oxygen." },
      { question: "Unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], correctIndex: 2, explanation: "Current is measured in Amperes (A)." },
      { question: "Red Planet?", options: ["Venus", "Jupiter", "Saturn", "Mars"], correctIndex: 3, explanation: "Mars looks red due to iron oxide on its surface." },
      { question: "Powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], correctIndex: 2, explanation: "Mitochondria produce ATP through cellular respiration." },
      { question: "Speed of light in vacuum?", options: ["3×10⁶ m/s", "3×10⁷ m/s", "3×10⁸ m/s", "3×10⁹ m/s"], correctIndex: 2, explanation: "c = 3×10⁸ m/s." },
      { question: "Gas plants absorb in photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, explanation: "Plants absorb CO₂ and release O₂." },
      { question: "Newton's first law is also called?", options: ["Law of Energy", "Law of Inertia", "Law of Motion", "Law of Gravity"], correctIndex: 1, explanation: "Objects resist changes in motion — Law of Inertia." },
      { question: "Atomic number of Carbon?", options: ["4", "6", "8", "12"], correctIndex: 1, explanation: "Carbon has 6 protons, atomic number 6." },
    ],
    medium: [
      { question: "Ohm's Law?", options: ["V = IR", "P = IV", "F = ma", "E = mc²"], correctIndex: 0, explanation: "V = IR (Voltage = Current × Resistance)." },
      { question: "Bond in NaCl?", options: ["Covalent", "Metallic", "Ionic", "Hydrogen"], correctIndex: 2, explanation: "NaCl has an ionic bond — Na⁺ and Cl⁻." },
      { question: "Plants lose water through leaves via?", options: ["Transpiration", "Respiration", "Evaporation", "Osmosis"], correctIndex: 0, explanation: "Transpiration — water loss through stomata." },
      { question: "Formula for kinetic energy?", options: ["mgh", "½mv²", "mv²", "Fd"], correctIndex: 1, explanation: "KE = ½mv²." },
      { question: "Organelle for protein synthesis?", options: ["Golgi body", "Mitochondria", "Ribosome", "Lysosome"], correctIndex: 2, explanation: "Ribosomes translate mRNA into proteins." },
      { question: "pH of neutral solution at 25°C?", options: ["0", "7", "10", "14"], correctIndex: 1, explanation: "Neutral pH = 7." },
      { question: "Resistance when temperature rises in conductor?", options: ["Decreases", "Stays same", "Increases", "Becomes zero"], correctIndex: 2, explanation: "Higher temp → more vibration → higher resistance." },
    ],
    hard: [
      { question: "de Broglie wavelength formula?", options: ["λ = h/mv", "λ = mv/h", "λ = hv/m", "λ = m/hv"], correctIndex: 0, explanation: "λ = h/mv = h/p. All matter has wave properties." },
      { question: "Hybridization of carbon in CH₄?", options: ["sp", "sp²", "sp³", "sp³d"], correctIndex: 2, explanation: "4 equivalent bonds → sp³ hybridization." },
      { question: "Enzyme that unwinds DNA?", options: ["DNA Polymerase", "Ligase", "Helicase", "Primase"], correctIndex: 2, explanation: "Helicase breaks hydrogen bonds to unwind the double helix." },
    ],
  },
  history: {
    easy: [
      { question: "India gained independence in which year?", options: ["1945", "1947", "1948", "1950"], correctIndex: 1, explanation: "India gained independence on 15 August 1947." },
      { question: "First Prime Minister of India?", options: ["Sardar Patel", "Rajendra Prasad", "Jawaharlal Nehru", "B.R. Ambedkar"], correctIndex: 2, explanation: "Jawaharlal Nehru was India's first PM (1947–1964)." },
      { question: "Battle of Plassey was fought in?", options: ["1757", "1857", "1657", "1947"], correctIndex: 0, explanation: "Battle of Plassey (1757) — beginning of British power in India." },
      { question: "Who launched the Non-Cooperation Movement?", options: ["Subhas Chandra Bose", "Bal Gangadhar Tilak", "Mahatma Gandhi", "Lala Lajpat Rai"], correctIndex: 2, explanation: "Gandhi launched it in 1920." },
    ],
    medium: [
      { question: "Quit India Movement was launched in?", options: ["1940", "1942", "1944", "1945"], correctIndex: 1, explanation: "'Quit India' launched on 8 August 1942." },
      { question: "First session of Indian National Congress?", options: ["1881", "1885", "1890", "1905"], correctIndex: 1, explanation: "INC founded in 1885 in Bombay." },
      { question: "Who wrote 'Hind Swaraj'?", options: ["Nehru", "Ambedkar", "Gandhi", "Tilak"], correctIndex: 2, explanation: "Gandhi wrote 'Hind Swaraj' in 1909." },
    ],
    hard: [
      { question: "Partition of Bengal by Lord Curzon occurred in?", options: ["1900", "1902", "1905", "1911"], correctIndex: 2, explanation: "Partition of Bengal in 1905 fuelled the Swadeshi Movement." },
      { question: "Jallianwala Bagh massacre year?", options: ["1915", "1917", "1919", "1921"], correctIndex: 2, explanation: "Jallianwala Bagh massacre on 13 April 1919." },
    ],
  },
};

const TOPICS = [
  { id:"math",    label:"Mathematics", code:"MATH", accent:"#7eb5cb" },
  { id:"science", label:"Science",     code:"SCI",  accent:"#7ecba1" },
  { id:"history", label:"History",     code:"HIST", accent:"#cba87e" },
];
const DIFFS  = ["easy","medium","hard"];
const Q_COUNT = 8;
const TIME_PER_Q = 30;

const GREEN = "#7ecba1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes blob-drift{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-18px)scale(1.04)}66%{transform:translate(-18px,22px)scale(.97)}}
@keyframes progress-fill{from{width:0}to{width:var(--w)}}
@keyframes bar-shrink{from{width:100%}to{width:0%}}
@keyframes scale-in{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
@keyframes slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes ping{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}

.fu{animation:fade-up .55s cubic-bezier(.16,1,.3,1) both}
.fi{animation:fade-in .6s ease both}
.si{animation:scale-in .45s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
.d4{animation-delay:.24s}.d5{animation-delay:.3s}.d6{animation-delay:.38s}

/* ── Root ── */
.qz-root{min-height:100vh;background:#0c0c0f;position:relative;overflow-x:hidden}
.qz-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}

/* ── Topbar ── */
.qz-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(12,12,15,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:14px 28px;
  display:flex;align-items:center;gap:12px;
}
.qz-topbar-title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:#f0ede6;flex:1}
.qz-topbar-sub{font-size:12px;font-weight:500;color:rgba(232,230,223,.3);font-family:'JetBrains Mono',monospace}

/* ── Btns ── */
.qz-btn-ghost{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.qz-btn-ghost:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.qz-btn-primary{
  padding:13px 28px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${GREEN},#a8e6c4,${GREEN});background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.qz-btn-primary:hover{background-position:right;transform:translateY(-1px)}
.qz-btn-primary:disabled{opacity:.35;cursor:default;transform:none}

/* ── Card ── */
.qz-card{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:20px;
  position:relative;overflow:hidden;
  transition:border-color .25s;
}
.qz-card::before{content:'';position:absolute;inset:0;border-radius:20px;background:linear-gradient(135deg,rgba(126,203,161,.03),transparent 60%);pointer-events:none}
.qz-card:hover{border-color:rgba(126,203,161,.12)}

/* ── Topic chip ── */
.qz-topic{
  padding:14px 18px;border-radius:14px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  cursor:pointer;text-align:center;
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.qz-topic:hover{border-color:rgba(255,255,255,.15);transform:translateY(-2px)}
.qz-topic.selected{border-color:rgba(126,203,161,.3);background:rgba(126,203,161,.07)}
.qz-topic-code{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;margin-bottom:4px}
.qz-topic-label{font-size:13px;font-weight:800;color:#f0ede6}

/* ── Diff chip ── */
.qz-diff{
  flex:1;padding:10px;border-radius:10px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  cursor:pointer;text-align:center;
  font-size:12px;font-weight:800;color:rgba(232,230,223,.4);
  letter-spacing:.04em;text-transform:uppercase;
  transition:all .2s;
}
.qz-diff:hover{border-color:rgba(255,255,255,.15);color:#e8e6df}
.qz-diff.selected{background:rgba(126,203,161,.08);border-color:rgba(126,203,161,.25);color:${GREEN}}

/* ── Timer bar ── */
.qz-timer-track{height:4px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden;margin-bottom:22px}
.qz-timer-fill{height:100%;border-radius:999px;animation:bar-shrink var(--dur) linear forwards}

/* ── Question card ── */
.qz-q-num{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(126,203,161,.6);font-family:'JetBrains Mono',monospace;margin-bottom:10px}
.qz-q-text{font-size:17px;font-weight:800;color:#f0ede6;line-height:1.45;letter-spacing:-.01em;margin-bottom:22px}

/* ── Option ── */
.qz-opt{
  width:100%;padding:14px 18px;border-radius:13px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.025);
  display:flex;align-items:center;gap:12px;
  cursor:pointer;text-align:left;
  font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:rgba(232,230,223,.75);
  transition:all .2s cubic-bezier(.16,1,.3,1);
  position:relative;overflow:hidden;
}
.qz-opt:hover{border-color:rgba(126,203,161,.25);background:rgba(126,203,161,.05);color:#f0ede6}
.qz-opt.correct{background:rgba(126,203,161,.1);border-color:rgba(126,203,161,.4);color:${GREEN}}
.qz-opt.wrong{background:rgba(203,126,154,.1);border-color:rgba(203,126,154,.35);color:#cb7e9a}
.qz-opt.selected-neutral{background:rgba(126,181,203,.08);border-color:rgba(126,181,203,.3);color:#7eb5cb}
.qz-opt-letter{
  width:26px;height:26px;border-radius:8px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  transition:all .2s;
}
.qz-opt.correct .qz-opt-letter{background:rgba(126,203,161,.18);border-color:rgba(126,203,161,.4);color:${GREEN}}
.qz-opt.wrong   .qz-opt-letter{background:rgba(203,126,154,.15);border-color:rgba(203,126,154,.3);color:#cb7e9a}

/* ── Explanation ── */
.qz-exp{
  margin-top:16px;padding:16px 18px;border-radius:12px;
  background:rgba(126,181,203,.05);border:1px solid rgba(126,181,203,.15);
  animation:fade-up .4s cubic-bezier(.16,1,.3,1) both;
}
.qz-exp-label{font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7eb5cb;font-family:'JetBrains Mono',monospace;margin-bottom:6px}
.qz-exp-text{font-size:13px;color:rgba(232,230,223,.6);line-height:1.75;font-weight:500}

/* ── HUD ── */
.qz-hud{
  display:flex;gap:10px;align-items:center;
  padding:12px 18px;border-radius:12px;
  background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);
  margin-bottom:20px;
}
.qz-hud-item{text-align:center;flex:1}
.qz-hud-val{font-family:'Instrument Serif',serif;font-style:italic;font-size:26px;font-weight:500;line-height:1}
.qz-hud-lbl{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,230,223,.3);font-family:'JetBrains Mono',monospace;margin-top:2px}
.qz-hud-div{width:1px;height:32px;background:rgba(255,255,255,.07)}

/* ── Results ── */
.qz-score-ring{position:relative;display:inline-flex;align-items:center;justify-content:center}
.qz-review-row{
  display:flex;gap:10px;align-items:flex-start;
  padding:14px 16px;border-radius:10px;
  background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);
}
.qz-review-icon{
  width:28px;height:28px;border-radius:8px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;
}

/* ── Progress bar ── */
.qz-prog-fill{height:100%;border-radius:999px;animation:progress-fill 1s cubic-bezier(.16,1,.3,1) both}

/* Container */
.qz-content{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:32px 24px}
`;

/* ── Helpers ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function buildQuestions(topicId, difficulty, count) {
  const pool = QUESTION_BANK[topicId]?.[difficulty] || [];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

function RingProgress({ value, size=120, stroke=8, accent=GREEN }) {
  const r    = (size - stroke*2)/2;
  const circ = 2*Math.PI*r;
  const off  = circ - (value/100)*circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent+"22"} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)", filter:`drop-shadow(0 0 8px ${accent}70)` }}
      />
    </svg>
  );
}

export default function Quiz() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [screen,   setScreen]   = useState("setup");
  const [topic,    setTopic]    = useState(null);
  const [diff,     setDiff]     = useState("medium");
  const [questions,setQuestions]= useState([]);
  const [qIdx,     setQIdx]     = useState(0);
  const [answers,  setAnswers]  = useState([]);
  const [chosen,   setChosen]   = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const timerRef = useRef(null);

  const currentQ = questions[qIdx];

  /* Timer */
  useEffect(() => {
    if (screen !== "quiz" || revealed) return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, screen]);

  const handleTimeout = useCallback(() => {
    clearInterval(timerRef.current);
    setRevealed(true);
    setAnswers(prev => [...prev, { chosen:null, isCorrect:false, timedOut:true }]);
  }, []);

  const handleAnswer = (idx) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    const isCorrect = idx === currentQ.correctIndex;
    setChosen(idx);
    setRevealed(true);
    setAnswers(prev => [...prev, { chosen:idx, isCorrect, timedOut:false }]);
  };

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) { setScreen("results"); return; }
    setQIdx(i => i+1);
    setChosen(null);
    setRevealed(false);
  };

  const startQuiz = () => {
    if (!topic) return;
    const qs = buildQuestions(topic.id, diff, Q_COUNT);
    setQuestions(qs); setAnswers([]); setQIdx(0);
    setChosen(null); setRevealed(false);
    setScreen("quiz");
  };

  const reset = () => {
    setTopic(null); setDiff("medium");
    setQuestions([]); setAnswers([]);
    setQIdx(0); setChosen(null); setRevealed(false);
    setScreen("setup");
  };

  const score   = answers.filter(a => a.isCorrect).length;
  const total   = questions.length;
  const scorePct= total ? Math.round((score/total)*100) : 0;

  /* ── SETUP ── */
  if (screen === "setup") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="qz-root">
        <div className="qz-blob" style={{ width:500,height:500,background:"rgba(126,203,161,.05)",top:-140,right:-120 }}/>
        <div className="qz-topbar">
          <button className="qz-btn-ghost" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
          <span className="qz-topbar-title">Quiz</span>
        </div>
        <div className="qz-content">
          {/* Hero */}
          <div className="fu" style={{ marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.2)",marginBottom:16 }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:GREEN }}/>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,fontFamily:"'JetBrains Mono',monospace" }}>Knowledge Check</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:800,letterSpacing:"-.03em",color:"#f0ede6",lineHeight:1.1,marginBottom:10 }}>
              Test your{" "}
              <span style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontWeight:400,color:GREEN }}>knowledge.</span>
            </h1>
            <p style={{ fontSize:14,color:"rgba(232,230,223,.35)",lineHeight:1.75,fontWeight:500 }}>
              Pick a subject and difficulty. {Q_COUNT} questions, {TIME_PER_Q}s each.
            </p>
          </div>

          {/* Topic picker */}
          <div className="qz-card fu d1" style={{ padding:24,marginBottom:16 }}>
            <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:14 }}>
              Select Subject
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
              {TOPICS.map(t => (
                <div key={t.id} className={`qz-topic ${topic?.id===t.id?"selected":""}`}
                  onClick={() => setTopic(t)}
                >
                  <div className="qz-topic-code" style={{ color:t.accent }}>{t.code}</div>
                  <div className="qz-topic-label">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="qz-card fu d2" style={{ padding:24,marginBottom:28 }}>
            <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:14 }}>
              Difficulty
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {DIFFS.map(d => (
                <button key={d} className={`qz-diff ${diff===d?"selected":""}`} onClick={() => setDiff(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="fu d3" style={{ textAlign:"center" }}>
            <button className="qz-btn-primary" disabled={!topic} onClick={startQuiz}
              style={{ fontSize:14,padding:"15px 44px" }}>
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ── QUIZ ── */
  if (screen === "quiz" && currentQ) {
    const timerPct = (timeLeft/TIME_PER_Q)*100;
    const timerColor = timerPct > 50 ? GREEN : timerPct > 25 ? "#cba87e" : "#cb7e9a";
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }}/>
        <div className="qz-root">
          <div className="qz-topbar">
            <button className="qz-btn-ghost" onClick={reset}>← Exit</button>
            <span className="qz-topbar-title">{topic?.label}</span>
            <span className="qz-topbar-sub" style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"rgba(232,230,223,.3)" }}>
              {qIdx+1} / {questions.length}
            </span>
          </div>
          <div className="qz-content">
            {/* Timer bar */}
            <div className="qz-timer-track">
              <div className="qz-timer-fill" style={{
                "--dur":`${TIME_PER_Q}s`,
                background:`linear-gradient(90deg,${timerColor},${timerColor}90)`,
                boxShadow:`0 0 8px ${timerColor}60`,
              }}/>
            </div>

            {/* HUD */}
            <div className="qz-hud fu">
              <div className="qz-hud-item">
                <div className="qz-hud-val" style={{ color:GREEN }}>{score}</div>
                <div className="qz-hud-lbl">Correct</div>
              </div>
              <div className="qz-hud-div"/>
              <div className="qz-hud-item">
                <div className="qz-hud-val" style={{ color:"rgba(232,230,223,.6)" }}>{questions.length - qIdx - 1}</div>
                <div className="qz-hud-lbl">Remaining</div>
              </div>
              <div className="qz-hud-div"/>
              <div className="qz-hud-item">
                <div className="qz-hud-val" style={{ color: timeLeft<=10 ? "#cb7e9a" : "rgba(232,230,223,.6)" }}>{timeLeft}s</div>
                <div className="qz-hud-lbl">Time</div>
              </div>
            </div>

            {/* Question */}
            <div className="qz-card si" key={qIdx} style={{ padding:26,marginBottom:14 }}>
              <div className="qz-q-num">Q{qIdx+1} · {diff}</div>
              <p className="qz-q-text">{currentQ.question}</p>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {currentQ.options.map((opt, i) => {
                  let cls = "qz-opt";
                  if (revealed) {
                    if (i === currentQ.correctIndex) cls += " correct";
                    else if (i === chosen && i !== currentQ.correctIndex) cls += " wrong";
                  } else if (i === chosen) cls += " selected-neutral";
                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={revealed}>
                      <div className="qz-opt-letter">{String.fromCharCode(65+i)}</div>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="qz-exp">
                  <div className="qz-exp-label">Explanation</div>
                  <p className="qz-exp-text">{currentQ.explanation}</p>
                </div>
              )}
            </div>

            {revealed && (
              <div className="fu" style={{ textAlign:"center" }}>
                <button className="qz-btn-primary" onClick={handleNext}>
                  {qIdx+1 >= questions.length ? "See Results" : "Next Question →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ── RESULTS ── */
  if (screen === "results") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="qz-root">
        <div className="qz-topbar">
          <button className="qz-btn-ghost" onClick={reset}>Try Again</button>
          <span className="qz-topbar-title">Results · {topic?.label}</span>
        </div>
        <div className="qz-content">
          {/* Score hero */}
          <div className="fu" style={{ textAlign:"center",marginBottom:32 }}>
            <div className="qz-score-ring" style={{ marginBottom:16 }}>
              <RingProgress value={scorePct} size={130} stroke={9} accent={scorePct>=70?GREEN:scorePct>=40?"#cba87e":"#cb7e9a"}/>
              <div style={{ position:"absolute",display:"flex",flexDirection:"column",alignItems:"center" }}>
                <span style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:38,fontWeight:500,color:scorePct>=70?GREEN:scorePct>=40?"#cba87e":"#cb7e9a" }}>{scorePct}%</span>
              </div>
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",color:"#f0ede6",marginBottom:6 }}>
              {scorePct>=80?"Outstanding":scorePct>=60?"Well done":scorePct>=40?"Keep going":"Review needed"}
            </h2>
            <p style={{ fontSize:14,color:"rgba(232,230,223,.4)",fontWeight:500 }}>
              {score} of {total} correct · {diff} difficulty
            </p>
          </div>

          {/* Mini stats */}
          <div className="fu d1 qz-hud" style={{ marginBottom:28 }}>
            {[
              { label:"Correct",   val:score,        color:GREEN },
              { label:"Wrong",     val:total-score,  color:"#cb7e9a" },
              { label:"Score",     val:`${scorePct}%`,color:"rgba(232,230,223,.7)" },
            ].map((s,i) => (
              <React.Fragment key={s.label}>
                {i>0&&<div className="qz-hud-div"/>}
                <div className="qz-hud-item">
                  <div className="qz-hud-val" style={{ color:s.color }}>{s.val}</div>
                  <div className="qz-hud-lbl">{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Question review */}
          <div style={{ fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(126,203,161,.6)",fontFamily:"'JetBrains Mono',monospace",marginBottom:14 }}>
            Question Review
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {questions.map((q,idx) => {
              const ans = answers[idx];
              return (
                <div key={idx} className="qz-card fu" style={{ padding:22,animationDelay:`${idx*.05}s` }}>
                  <div style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:12 }}>
                    <div className="qz-review-icon" style={{
                      background:ans?.isCorrect?"rgba(126,203,161,.12)":"rgba(203,126,154,.12)",
                      color:ans?.isCorrect?GREEN:"#cb7e9a",
                    }}>
                      {ans?.isCorrect?"✓":"✗"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"rgba(232,230,223,.3)",marginBottom:4,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em" }}>Q{idx+1}</div>
                      <p style={{ fontSize:14,fontWeight:700,color:"#f0ede6",lineHeight:1.45 }}>{q.question}</p>
                    </div>
                  </div>
                  <div style={{ paddingLeft:38,marginBottom:10,fontSize:13 }}>
                    <div style={{ color:GREEN,fontWeight:600,marginBottom:ans?.isCorrect?0:4 }}>
                      Correct: <strong>{q.options[q.correctIndex]}</strong>
                    </div>
                    {!ans?.isCorrect && (
                      <div style={{ color:ans?.timedOut?"#cba87e":"#cb7e9a",fontWeight:600 }}>
                        {ans?.timedOut?"Timed out":`Your answer: ${ans?.chosen!=null?q.options[ans.chosen]:"—"}`}
                      </div>
                    )}
                  </div>
                  <div style={{ paddingLeft:38 }}>
                    <div className="qz-exp" style={{ marginTop:0 }}>
                      <div className="qz-exp-label">Explanation</div>
                      <p className="qz-exp-text">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fu" style={{ display:"flex",gap:10,justifyContent:"center",marginTop:32,flexWrap:"wrap" }}>
            <button className="qz-btn-primary" onClick={reset}>Try Another Quiz</button>
            <button className="qz-btn-ghost" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
            <button className="qz-btn-ghost" onClick={() => navigate("/student/ai-tutor")}>AI Tutor</button>
          </div>
        </div>
      </div>
    </>
  );

  return null;
}
