/**
 * AIDoubtSolver.jsx — PathwayAI
 * Image-based AI doubt solver — snap or upload a question, get step-by-step AI explanation
 * Design: #0c0c0f base · Syne 800 headings · Instrument Serif italics
 * #7ecba1 green accent · JetBrains Mono for data
 */

import React, { useState, useRef, useCallback } from "react";
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
@keyframes soft-blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes ping-slow{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}
@keyframes toast-in{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes scan-line{0%{top:0}100%{top:100%}}
@keyframes shimmer-bar{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes thinking-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
@keyframes step-reveal{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes bar-fill{from{width:0}to{width:var(--w)}}
@keyframes progress-fill{from{width:0%}to{width:100%}}

.ds-fade-up{animation:fade-up .65s cubic-bezier(.16,1,.3,1) both}
.ds-fade-in{animation:fade-in .5s ease both}
.ds-blink{animation:soft-blink 2.2s ease-in-out infinite}
.ds-ping{animation:ping-slow 2.5s ease-out infinite}

/* Layout */
.ds-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.ds-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0;animation:blob-drift 14s ease-in-out infinite}
.ds-pad{position:relative;z-index:1;padding:28px 32px;max-width:1360px;margin:0 auto}

/* Card */
.ds-card{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  border-radius:20px;position:relative;overflow:hidden;
  transition:border-color .25s;
}
.ds-card::before{
  content:'';position:absolute;inset:0;border-radius:20px;
  background:linear-gradient(135deg,rgba(126,203,161,.035),transparent 60%);
  pointer-events:none;
}
.ds-card-inner{padding:24px}

/* Nav btn */
.ds-nav-btn{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.6);
  font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.ds-nav-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#e8e6df}

/* Primary btn */
.ds-btn-primary{
  padding:13px 0;border-radius:14px;border:none;width:100%;
  background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);
  background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;
  cursor:pointer;transition:all .3s;
}
.ds-btn-primary:hover{background-position:right;transform:translateY(-1px)}
.ds-btn-primary:disabled{background:rgba(255,255,255,.06);color:rgba(232,230,223,.2);cursor:default;transform:none}

/* Ghost btn */
.ds-btn-ghost{
  padding:11px 0;border-radius:12px;width:100%;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.03);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.ds-btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:#e8e6df}

/* Toast */
.ds-toast{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  padding:13px 20px;border-radius:14px;
  background:rgba(20,20,24,.92);backdrop-filter:blur(24px);
  border:1px solid rgba(126,203,161,.2);box-shadow:0 12px 48px rgba(0,0,0,.5);
  color:#e8e6df;font-size:13px;font-weight:700;
  display:flex;align-items:center;gap:10px;
  animation:toast-in .4s cubic-bezier(.16,1,.3,1) both;
  font-family:'Syne',sans-serif;
}

/* Label */
.ds-label{
  font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;margin-bottom:14px;
}

/* Drop zone */
.ds-drop{
  border:2px dashed rgba(255,255,255,.1);
  border-radius:18px;
  padding:40px 24px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  cursor:pointer;transition:all .3s;
  position:relative;overflow:hidden;
  text-align:center;
}
.ds-drop:hover,.ds-drop.drag-over{
  border-color:rgba(126,203,161,.4);
  background:rgba(126,203,161,.04);
}
.ds-drop.drag-over{transform:scale(1.01)}

/* History card */
.ds-hist{
  padding:14px 16px;border-radius:14px;
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  cursor:pointer;
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.ds-hist:hover{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.13);transform:translateX(3px)}

/* Step card */
.ds-step{
  padding:16px 18px;border-radius:14px;
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  position:relative;
  animation:step-reveal .45s cubic-bezier(.16,1,.3,1) both;
}
.ds-step::before{
  content:'';position:absolute;left:0;top:12px;bottom:12px;width:2px;
  border-radius:2px;
}

/* Thinking dots */
.ds-dot-1,.ds-dot-2,.ds-dot-3{
  display:inline-block;width:6px;height:6px;border-radius:50%;
  background:#7ecba1;margin:0 2px;
  animation:thinking-dot 1.2s ease-in-out infinite;
}
.ds-dot-2{animation-delay:.2s}
.ds-dot-3{animation-delay:.4s}

/* Subject pill */
.ds-subj{
  display:inline-flex;align-items:center;
  padding:5px 12px;border-radius:999px;
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;
  cursor:pointer;border:1.5px solid;
  transition:all .2s;
}

/* Image preview */
.ds-img-preview{
  border-radius:14px;overflow:hidden;
  border:1px solid rgba(255,255,255,.1);
  position:relative;line-height:0;
}

/* Shimmer loading */
.ds-shimmer{
  position:relative;overflow:hidden;
  background:rgba(255,255,255,.04);
  border-radius:10px;
}
.ds-shimmer::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(126,203,161,.06),transparent);
  animation:shimmer-bar 1.8s ease-in-out infinite;
}

/* Confidence bar */
.ds-conf-bar{
  height:5px;border-radius:999px;
  background:rgba(255,255,255,.06);
  overflow:hidden;
}
.ds-conf-fill{
  height:100%;border-radius:999px;
  animation:bar-fill 1.2s cubic-bezier(.16,1,.3,1) both;
}

/* Camera overlay scan line */
.ds-scan-line{
  position:absolute;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,#7ecba1,transparent);
  animation:scan-line 1.8s ease-in-out infinite;
  pointer-events:none;
}

@media(max-width:980px){.ds-main-grid{grid-template-columns:1fr !important}}
@media(max-width:640px){.ds-pad{padding:18px 16px !important}}
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

const SUBJECTS = [
  { id:"maths",   label:"Mathematics", code:"MA", accent:ACCENT.blue  },
  { id:"science", label:"Science",     code:"SC", accent:ACCENT.green },
  { id:"physics", label:"Physics",     code:"PH", accent:ACCENT.amber },
  { id:"chem",    label:"Chemistry",   code:"CH", accent:ACCENT.rose  },
  { id:"history", label:"History",     code:"HI", accent:ACCENT.amber },
  { id:"english", label:"English",     code:"EN", accent:ACCENT.blue  },
];

const DEMO_SOLUTIONS = {
  maths: {
    detected: "Quadratic equation: 2x² + 5x − 3 = 0",
    concept: "Quadratic Equations — Factorisation Method",
    confidence: 94,
    steps: [
      { n:1, title:"Identify the equation form", text:"The equation is in standard form ax² + bx + c = 0, where a = 2, b = 5, c = −3.", accent:ACCENT.blue  },
      { n:2, title:"Find the product and sum",   text:"We need two numbers that multiply to (a × c) = 2 × −3 = −6, and add to b = 5. Those numbers are +6 and −1.", accent:ACCENT.green },
      { n:3, title:"Split the middle term",      text:"Rewrite: 2x² + 6x − x − 3 = 0. This splits the middle term using our two numbers.", accent:ACCENT.amber },
      { n:4, title:"Factorise by grouping",      text:"Group: (2x² + 6x) + (−x − 3) = 0 → 2x(x + 3) − 1(x + 3) = 0 → (2x − 1)(x + 3) = 0", accent:ACCENT.rose  },
      { n:5, title:"Solve for x",                text:"Set each factor to zero: 2x − 1 = 0 → x = 1/2, or x + 3 = 0 → x = −3. Final answers: x = 0.5 and x = −3", accent:ACCENT.blue  },
    ],
    tip: "Always verify your answers by substituting back into the original equation.",
    relatedTopics: ["Discriminant formula", "Completing the square", "Graphing parabolas"],
  },
  science: {
    detected: "Newton's Second Law diagram — F = ma",
    concept: "Newton's Second Law of Motion",
    confidence: 91,
    steps: [
      { n:1, title:"State the law",         text:"Newton's Second Law states that the net force on an object equals its mass multiplied by acceleration: F = ma.", accent:ACCENT.blue  },
      { n:2, title:"Identify the variables", text:"F = Net force (Newtons, N) · m = Mass of the object (kilograms, kg) · a = Acceleration (m/s²)", accent:ACCENT.green },
      { n:3, title:"Understand the relationship", text:"Force and acceleration are directly proportional — if you double the force, acceleration doubles (assuming constant mass).", accent:ACCENT.amber },
      { n:4, title:"Rearrange for any unknown", text:"You can rearrange: a = F/m to find acceleration, or m = F/a to find mass, depending on what is unknown.", accent:ACCENT.rose  },
      { n:5, title:"Apply to the diagram",   text:"Using values from your diagram: if F = 20 N and m = 4 kg, then a = 20 ÷ 4 = 5 m/s² in the direction of the force.", accent:ACCENT.blue  },
    ],
    tip: "Direction matters — force and acceleration are both vector quantities, always include direction in your answers.",
    relatedTopics: ["Newton's First Law", "Friction force", "Free body diagrams"],
  },
};

const DEMO_HISTORY = [
  { subject:"Mathematics", topic:"Quadratic Formula", time:"2 hrs ago",  score:94, accent:ACCENT.blue  },
  { subject:"Science",     topic:"Newton's Laws",     time:"Yesterday",  score:91, accent:ACCENT.green },
  { subject:"Chemistry",   topic:"Mole Concept",      time:"2 days ago", score:87, accent:ACCENT.rose  },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SLabel({ children, accent = GREEN }) {
  return <div className="ds-label" style={{ color: accent }}>{children}</div>;
}

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 11H2L8 2Z" fill={GREEN} opacity=".85"/>
      <circle cx="8" cy="11" r="2.5" fill={GREEN}/>
    </svg>
  );
}

function ThinkingDots() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
      <span className="ds-dot-1"/><span className="ds-dot-2"/><span className="ds-dot-3"/>
    </span>
  );
}

function SolutionView({ solution, onClear }) {
  const [expandedStep, setExpandedStep] = useState(null);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Detected question */}
      <div className="ds-card" style={{ background:"rgba(126,203,161,.025)", borderColor:"rgba(126,203,161,.15)" }}>
        <div className="ds-card-inner">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <SLabel>Detected Question</SLabel>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ padding:"3px 10px", borderRadius:8, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}` }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:GREEN }}>CONFIDENCE · {solution.confidence}%</span>
              </div>
            </div>
          </div>
          <p style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, color:"#f0ede6", lineHeight:1.5, marginBottom:12 }}>
            "{solution.detected}"
          </p>
          <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"rgba(232,230,223,.3)", letterSpacing:".12em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>Concept Identified</div>
            <div style={{ fontSize:14, fontWeight:700, color:GREEN }}>{solution.concept}</div>
          </div>
          {/* Confidence bar */}
          <div style={{ marginTop:12 }}>
            <div className="ds-conf-bar">
              <div className="ds-conf-fill" style={{ "--w":`${solution.confidence}%`, width:`${solution.confidence}%`, background:`linear-gradient(90deg,${GREEN}60,${GREEN})`, boxShadow:`0 0 8px ${GREEN}50` }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Step by step */}
      <div className="ds-card">
        <div className="ds-card-inner">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <SLabel>Step-by-Step Solution</SLabel>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", marginBottom:14 }}>{solution.steps.length} steps</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {solution.steps.map((s, i) => (
              <div key={i} className="ds-step"
                style={{ animationDelay:`${i*0.09}s`, paddingLeft:22, cursor:"pointer" }}
                onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              >
                {/* Left accent line */}
                <div style={{ position:"absolute", left:0, top:12, bottom:12, width:2, borderRadius:2, background:s.accent.base, boxShadow:`0 0 6px ${s.accent.base}60` }}/>

                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: expandedStep===i ? 10 : 0 }}>
                  {/* Step number */}
                  <div style={{ width:26, height:26, borderRadius:8, background:s.accent.dim, border:`1px solid ${s.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:s.accent.base }}>{s.n}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:"#f0ede6", flex:1 }}>{s.title}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0, transition:"transform .2s", transform: expandedStep===i ? "rotate(180deg)" : "none" }}>
                    <path d="M2 4L6 8L10 4" stroke="rgba(232,230,223,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {expandedStep === i && (
                  <div style={{ paddingLeft:38, paddingTop:4, animation:"fade-in .2s ease" }}>
                    <p style={{ fontSize:13, color:"rgba(232,230,223,.6)", lineHeight:1.75, fontWeight:500 }}>{s.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="ds-card" style={{ background:"rgba(203,168,126,.025)", borderColor:"rgba(203,168,126,.12)" }}>
        <div className="ds-card-inner">
          <SLabel accent={ACCENT.amber.base}>Pro Tip</SLabel>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ width:30, height:30, borderRadius:9, background:ACCENT.amber.dim, border:`1px solid ${ACCENT.amber.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:ACCENT.amber.base, fontWeight:700 }}>TIP</span>
            </div>
            <p style={{ fontSize:13, color:"rgba(232,230,223,.55)", lineHeight:1.75, fontWeight:500 }}>{solution.tip}</p>
          </div>
        </div>
      </div>

      {/* Related topics */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {solution.relatedTopics.map((t, i) => (
          <button key={i} style={{
            padding:"6px 14px", borderRadius:999,
            border:"1px solid rgba(255,255,255,.1)",
            background:"rgba(255,255,255,.03)",
            color:"rgba(232,230,223,.45)", fontSize:12, fontWeight:700,
            fontFamily:"'Syne',sans-serif", cursor:"pointer", transition:"all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(126,203,161,.08)"; e.currentTarget.style.borderColor="rgba(126,203,161,.25)"; e.currentTarget.style.color=GREEN; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; e.currentTarget.style.color="rgba(232,230,223,.45)"; }}
          >
            {t} →
          </button>
        ))}
      </div>

      {/* Clear */}
      <button className="ds-btn-ghost" onClick={onClear}>Solve Another Question</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AIDoubtSolver() {
  const navigate  = useNavigate();
  const { user }  = useApp();
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);
  const videoRef  = useRef(null);

  const [subject,    setSubject]    = useState("maths");
  const [imageUrl,   setImageUrl]   = useState(null);
  const [imageFile,  setImageFile]  = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [solving,    setSolving]    = useState(false);
  const [solution,   setSolution]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [camActive,  setCamActive]  = useState(false);
  const [camReady,   setCamReady]   = useState(false);
  const [note,       setNote]       = useState("");
  const streamRef = useRef(null);

  const showToast = (msg, accent = GREEN) => {
    setToast({ msg, accent });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── File handling ── */
  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload an image file", ACCENT.rose.base);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageFile(file);
    setSolution(null);
    showToast("Image loaded — ready to solve!");
  }, []);

  const onFileChange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);

  /* ── Camera ── */
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamActive(true);
      setCamReady(true);
    } catch {
      showToast("Camera access denied", ACCENT.rose.base);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setImageFile(blob);
      setSolution(null);
    }, "image/jpeg");
    // Stop cam
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamActive(false);
    setCamReady(false);
    showToast("Photo captured!");
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamActive(false);
    setCamReady(false);
  };

  /* ── Solve ── */
  const solve = async () => {
    if (!imageFile) { showToast("Upload or capture an image first", ACCENT.amber.base); return; }
    setSolving(true);
    setSolution(null);
    showToast("AI is analysing your question...");

    try {
      // Build base64 from imageFile
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = e => res(e.target.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(imageFile instanceof Blob ? imageFile : imageFile);
      });

      // ── Ollama Vision (llava) ──────────────────────────────────────────────
      // Requires:  ollama pull llava
      // Start:     OLLAMA_ORIGINS="*" ollama serve
      // Ollama's /api/generate endpoint accepts an `images` array of base64 strings.
      const OLLAMA_BASE        = "http://localhost:11434";
      const OLLAMA_VISION_MODEL = "llava"; // or llava:13b, llava:34b, bakllava, etc.

      const subjectLabel = SUBJECTS.find(s => s.id === subject)?.label || subject;

      const prompt = `You are an expert educational AI tutor for school and college students in India.
The student has uploaded an image of a question or problem.
${note ? `Additional context from student: "${note}"` : ""}
Subject hint: ${subjectLabel}

Carefully read the image and provide a clear, step-by-step explanation.
Return ONLY valid JSON with no extra text, no markdown fences:
{
  "detected": "<one sentence describing what question/problem you see in the image>",
  "concept": "<the core concept or topic being tested>",
  "confidence": <integer 60-99>,
  "steps": [
    { "n": 1, "title": "<short step title>", "text": "<detailed explanation of this step>" },
    { "n": 2, "title": "<short step title>", "text": "<detailed explanation of this step>" }
  ],
  "tip": "<one practical tip for remembering or applying this concept>",
  "relatedTopics": ["<topic 1>", "<topic 2>", "<topic 3>"]
}
Use exactly 4–6 steps. Be friendly and clear for a student aged 14–22.`;

      // Ollama /api/generate — multimodal path (images array)
      const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:  OLLAMA_VISION_MODEL,
          prompt,
          images: [base64],   // raw base64, no data-URL prefix
          stream: false,
          format: "json",     // ask Ollama to enforce JSON output
        }),
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Ollama error ${response.status}: ${txt.slice(0, 120)}`);
      }
      const data = await response.json();
      const raw  = data.response || "";
      const json = raw.replace(/```json|```/g, "").trim();
      const sol  = JSON.parse(json);

      // Inject accent colours
      const accents = [ACCENT.blue, ACCENT.green, ACCENT.amber, ACCENT.rose, ACCENT.blue, ACCENT.green];
      sol.steps = sol.steps.map((s, i) => ({ ...s, accent: accents[i % accents.length] }));
      setSolution(sol);
      showToast("Solution ready!");

    } catch (err) {
      // Fall back to demo solution if Ollama is not running
      console.warn("Ollama vision error:", err?.message);
      const demo = DEMO_SOLUTIONS[subject] || DEMO_SOLUTIONS.maths;
      setSolution(demo);
      showToast("Ollama offline — showing demo. Run: ollama serve", ACCENT.amber.base);
    } finally {
      setSolving(false);
    }
  };

  const clearAll = () => {
    setImageUrl(null);
    setImageFile(null);
    setSolution(null);
    setNote("");
  };

  const subjectInfo = SUBJECTS.find(s => s.id === subject);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {toast && (
        <div className="ds-toast">
          <div style={{ width:8, height:8, borderRadius:"50%", background:toast.accent, flexShrink:0, boxShadow:`0 0 8px ${toast.accent}` }}/>
          {toast.msg}
        </div>
      )}

      <div className="ds-root">
        {/* Blobs */}
        <div className="ds-blob" style={{ width:560, height:560, background:"rgba(126,203,161,.05)", top:-160, right:-140 }}/>
        <div className="ds-blob" style={{ width:400, height:400, background:"rgba(126,181,203,.03)", bottom:160, left:-100, animationDelay:"4s", animationDuration:"18s" }}/>

        <div className="ds-pad">

          {/* Top nav */}
          <div className="ds-fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <button className="ds-nav-btn" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(126,203,161,.1)", border:"1px solid rgba(126,203,161,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <LogoMark/>
            </div>
          </div>

          {/* Hero */}
          <div className="ds-fade-up" style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ position:"relative", width:8, height:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
                <div className="ds-ping" style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>AI Doubt Solver</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(32px,3.5vw,48px)", fontWeight:800, lineHeight:1.0, letterSpacing:"-.04em", color:"#f0ede6", margin:0 }}>
              Snap a question,{" "}
              <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:GREEN }}>
                get the answer.
              </span>
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
              <div style={{ height:1, width:20, background:`linear-gradient(90deg,${GREEN},transparent)` }}/>
              <span style={{ fontSize:13, color:"rgba(232,230,223,.35)", fontWeight:600 }}>Upload or photograph any problem — AI explains it step by step</span>
            </div>
          </div>

          <div className="ds-main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1.1fr", gap:20 }}>

            {/* ════ LEFT — Upload section ════ */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Subject selector */}
              <div className="ds-fade-up ds-card" style={{ animationDelay:".06s" }}>
                <div className="ds-card-inner">
                  <SLabel>Select Subject</SLabel>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {SUBJECTS.map(s => (
                      <button key={s.id} className="ds-subj"
                        style={{
                          borderColor: subject===s.id ? s.accent.border : "rgba(255,255,255,.08)",
                          background:  subject===s.id ? s.accent.dim : "transparent",
                          color:       subject===s.id ? s.accent.base : "rgba(232,230,223,.4)",
                        }}
                        onClick={() => setSubject(s.id)}
                      >
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, opacity:.7 }}>{s.code}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Camera view or Upload */}
              {camActive ? (
                <div className="ds-fade-in ds-card">
                  <div className="ds-card-inner">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <SLabel accent={ACCENT.rose.base}>Camera</SLabel>
                      <button onClick={closeCamera} style={{ fontSize:12, color:"rgba(232,230,223,.35)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:14 }}>Close ×</button>
                    </div>
                    <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,.1)", position:"relative", lineHeight:0 }}>
                      <video ref={videoRef} autoPlay playsInline
                        style={{ width:"100%", display:"block", aspectRatio:"4/3", objectFit:"cover", background:"#060608" }}/>
                      <div className="ds-scan-line"/>
                      <div style={{ position:"absolute", inset:0, border:"2px solid transparent", borderRadius:14, boxShadow:"inset 0 0 0 2px rgba(126,203,161,.15)" }}/>
                    </div>
                    <button className="ds-btn-primary" style={{ marginTop:12 }} onClick={capturePhoto}>
                      Capture Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ds-fade-up ds-card" style={{ animationDelay:".1s" }}>
                  <div className="ds-card-inner">
                    <SLabel>Upload Question Image</SLabel>

                    {imageUrl ? (
                      <div>
                        <div className="ds-img-preview" style={{ marginBottom:12 }}>
                          <img src={imageUrl} alt="Uploaded question"
                            style={{ width:"100%", display:"block", maxHeight:280, objectFit:"contain", background:"#060608", padding:8 }}/>
                          {/* Overlay badge */}
                          <div style={{ position:"absolute", top:10, right:10, padding:"4px 10px", borderRadius:8, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)", border:`1px solid ${subjectInfo?.accent.border}` }}>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:subjectInfo?.accent.base, letterSpacing:".1em" }}>{subjectInfo?.label.toUpperCase()}</span>
                          </div>
                        </div>
                        <button className="ds-btn-ghost" style={{ fontSize:12, padding:"8px 0" }} onClick={clearAll}>
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`ds-drop ${dragging ? "drag-over" : ""}`}
                        onClick={() => fileRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                      >
                        {/* Icon */}
                        <div style={{ width:56, height:56, borderRadius:16, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:700, color:"#f0ede6", marginBottom:4 }}>Drop your question image here</p>
                          <p style={{ fontSize:12, color:"rgba(232,230,223,.3)", lineHeight:1.6 }}>JPG, PNG, WEBP — textbook pages, handwritten notes, diagrams</p>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <div style={{ padding:"6px 16px", borderRadius:999, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}` }}>
                            <span style={{ fontSize:12, fontWeight:700, color:GREEN }}>Browse files</span>
                          </div>
                          <div style={{ padding:"6px 16px", borderRadius:999, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"rgba(232,230,223,.45)" }}>or drag & drop</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFileChange} capture="environment"/>
                  </div>
                </div>
              )}

              {/* Camera button */}
              {!camActive && (
                <button onClick={openCamera} style={{
                  padding:"13px 0", borderRadius:14, cursor:"pointer",
                  border:`1px solid ${ACCENT.blue.border}`,
                  background:ACCENT.blue.dim,
                  color:ACCENT.blue.base, fontFamily:"'Syne',sans-serif",
                  fontSize:13, fontWeight:800, letterSpacing:".05em",
                  textTransform:"uppercase", transition:"all .2s", width:"100%",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Use Camera Instead
                </button>
              )}

              {/* Optional note */}
              <div className="ds-fade-up ds-card" style={{ animationDelay:".14s" }}>
                <div className="ds-card-inner">
                  <SLabel>Add Context (Optional)</SLabel>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="e.g. 'I don't understand step 3' or 'Focus on the diagram part'"
                    rows={3}
                    style={{
                      width:"100%", resize:"vertical", borderRadius:12,
                      background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.09)",
                      color:"#e8e6df", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:500,
                      padding:"12px 14px", lineHeight:1.65, outline:"none",
                      transition:"border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(126,203,161,.3)"}
                    onBlur={e => e.target.style.borderColor  = "rgba(255,255,255,.09)"}
                  />
                </div>
              </div>

              {/* Solve button */}
              <div className="ds-fade-up" style={{ animationDelay:".18s" }}>
                <button className="ds-btn-primary" onClick={solve} disabled={!imageUrl || solving}>
                  {solving ? <><ThinkingDots/> Analysing image...</> : "Solve This Question →"}
                </button>
              </div>
            </div>

            {/* ════ RIGHT — solution or history ════ */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {solving ? (
                /* Loading skeleton */
                <div className="ds-card" style={{ animationDelay:".08s" }}>
                  <div className="ds-card-inner">
                    <SLabel>AI is thinking...</SLabel>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:8 }}>
                      {[90, 70, 80, 65, 75].map((w, i) => (
                        <div key={i} className="ds-shimmer" style={{ height:18, width:`${w}%`, animationDelay:`${i*0.1}s` }}/>
                      ))}
                    </div>
                    <div style={{ marginTop:24, padding:"20px", borderRadius:14, border:"1px dashed rgba(126,203,161,.15)", textAlign:"center" }}>
                      <div style={{ fontSize:13, color:"rgba(232,230,223,.35)", marginBottom:8 }}>Identifying question type...</div>
                      <ThinkingDots/>
                    </div>
                  </div>
                </div>
              ) : solution ? (
                <SolutionView solution={solution} onClear={clearAll} />
              ) : (
                <>
                  {/* Empty state */}
                  <div className="ds-fade-up ds-card" style={{ animationDelay:".08s" }}>
                    <div className="ds-card-inner" style={{ textAlign:"center", padding:"40px 24px" }}>
                      <div style={{ width:64, height:64, borderRadius:18, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                      <p style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:22, color:"#f0ede6", marginBottom:10 }}>
                        Upload a question to begin.
                      </p>
                      <p style={{ fontSize:13, color:"rgba(232,230,223,.3)", lineHeight:1.75 }}>
                        Works with textbook pages, handwritten notes, diagrams, equations, and exam papers.
                      </p>
                    </div>
                  </div>

                  {/* History */}
                  <div className="ds-fade-up ds-card" style={{ animationDelay:".12s" }}>
                    <div className="ds-card-inner">
                      <SLabel>Recent Doubts</SLabel>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {DEMO_HISTORY.map((h, i) => (
                          <div key={i} className="ds-hist">
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ width:22, height:22, borderRadius:6, background:h.accent.dim, border:`1px solid ${h.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <div style={{ width:5, height:5, borderRadius:"50%", background:h.accent.base }}/>
                                </div>
                                <span style={{ fontSize:13, fontWeight:700, color:"#f0ede6" }}>{h.topic}</span>
                              </div>
                              <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, color:h.accent.base, filter:`drop-shadow(0 0 4px ${h.accent.base}60)` }}>{h.score}</span>
                            </div>
                            <div style={{ display:"flex", gap:8, paddingLeft:30 }}>
                              <span style={{ fontSize:11, color:"rgba(232,230,223,.3)", fontWeight:600 }}>{h.subject}</span>
                              <span style={{ color:"rgba(255,255,255,.12)", fontSize:11 }}>·</span>
                              <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>{h.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="ds-fade-up ds-card" style={{ animationDelay:".16s", background:"rgba(126,203,161,.02)", borderColor:"rgba(126,203,161,.08)" }}>
                    <div className="ds-card-inner">
                      <SLabel>How It Works</SLabel>
                      {[
                        ["01","Upload or snap a photo","Any subject, any class — textbook, notebook or exam paper"],
                        ["02","AI reads the question","Our model identifies the concept and difficulty level"],
                        ["03","Get step-by-step help","Clear, student-friendly explanation with tips"],
                      ].map(([n, title, desc]) => (
                        <div key={n} style={{ display:"flex", gap:14, marginBottom:14 }}>
                          <div style={{ width:28, height:28, borderRadius:8, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:GREEN }}>{n}</span>
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#f0ede6", marginBottom:2 }}>{title}</div>
                            <div style={{ fontSize:11, color:"rgba(232,230,223,.35)", lineHeight:1.6 }}>{desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop:32, padding:"16px 0", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontWeight:700, letterSpacing:".04em" }}>PathwayAI · Doubt Solver</span>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>Image AI · Always available</span>
          </div>
        </div>
      </div>
    </>
  );
}
