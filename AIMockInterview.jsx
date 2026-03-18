/**
 * AIMockInterview.jsx — PathwayAI
 * Truly real-time in-browser ML interview analysis
 *
 * ML stack (zero API, zero server):
 *   • Question generation  : Xenova/LaMini-Flan-T5-248M  (text2text, WASM)
 *   • Real-time scoring    : Instant NLP pipeline runs on EVERY speech interim
 *                            result (~50ms), updates live scores as user speaks
 *   • Post-submit deep eval: Xenova/distilbert-base-uncased-finetuned-sst-2-english
 *                            + full NLP for final polished scores
 *
 * Mic: getUserMedia → AudioContext(fftSize:1024) → AnalyserNode → 60fps RMS
 * STT: Xenova/whisper-tiny (WASM, no server, no Google) → chunks every 4s
 *      + typed fallback textarea (always visible, scores in real-time too)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
::-webkit-scrollbar-thumb{background:rgba(126,203,161,0.25);border-radius:10px}

@keyframes blob-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,28px) scale(.97)}}
@keyframes fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes soft-blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes ping-slow{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}
@keyframes toast-in{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(126,203,161,.4)}70%{box-shadow:0 0 0 12px rgba(126,203,161,0)}100%{box-shadow:0 0 0 0 rgba(126,203,161,0)}}
@keyframes thinking-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
@keyframes slide-in-right{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

.mi-fade-up{animation:fade-up .65s cubic-bezier(.16,1,.3,1) both}
.mi-fade-in{animation:fade-in .5s ease both}
.mi-blink{animation:soft-blink 2.2s ease-in-out infinite}
.mi-ping{animation:ping-slow 2.5s ease-out infinite}

.mi-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.mi-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0;animation:blob-drift 14s ease-in-out infinite}
.mi-pad{position:relative;z-index:1;padding:28px 32px;max-width:1400px;margin:0 auto}

.mi-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;position:relative;overflow:hidden;transition:border-color .25s}
.mi-card::before{content:'';position:absolute;inset:0;border-radius:20px;background:linear-gradient(135deg,rgba(126,203,161,.035),transparent 60%);pointer-events:none}
.mi-card-inner{padding:24px}

.mi-nav-btn{padding:9px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(232,230,223,.6);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
.mi-nav-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#e8e6df}

.mi-btn-primary{padding:13px 0;border-radius:14px;border:none;width:100%;background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);background-size:200%;color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .3s}
.mi-btn-primary:hover{background-position:right;transform:translateY(-1px)}
.mi-btn-primary:disabled{background:rgba(255,255,255,.06);color:rgba(232,230,223,.2);cursor:default;transform:none}

.mi-btn-ghost{padding:13px 0;border-radius:14px;width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
.mi-btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:#e8e6df}

.mi-toast{position:fixed;bottom:24px;right:24px;z-index:9999;padding:13px 20px;border-radius:14px;background:rgba(20,20,24,.92);backdrop-filter:blur(24px);border:1px solid rgba(126,203,161,.2);box-shadow:0 12px 48px rgba(0,0,0,.5);color:#e8e6df;font-size:13px;font-weight:700;display:flex;align-items:center;gap:10px;animation:toast-in .4s cubic-bezier(.16,1,.3,1) both;font-family:'Syne',sans-serif}

.mi-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:14px}

.mi-video-wrap{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#060608;position:relative;line-height:0}
.mi-video-wrap.active{border-color:rgba(126,203,161,.3);box-shadow:0 0 0 1px rgba(126,203,161,.1),0 8px 40px rgba(126,203,161,.12)}
.mi-video-wrap.recording{border-color:rgba(203,126,154,.4);box-shadow:0 0 0 1px rgba(203,126,154,.15),0 8px 40px rgba(203,126,154,.15);animation:pulse-ring 2s ease-out infinite}

.mi-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}

.mi-q-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px;position:relative;overflow:hidden}
.mi-q-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#7ecba1,transparent)}

.mi-bubble{padding:12px 16px;border-radius:12px;font-size:13px;font-weight:500;line-height:1.7;animation:fade-in .4s ease both}
.mi-bubble.user{background:rgba(126,203,161,.08);border:1px solid rgba(126,203,161,.15);color:#e8e6df;border-bottom-right-radius:4px;margin-left:16px}
.mi-bubble.ai{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:rgba(232,230,223,.7);border-bottom-left-radius:4px;margin-right:16px}

.mi-dot-1,.mi-dot-2,.mi-dot-3{display:inline-block;width:5px;height:5px;border-radius:50%;background:#7ecba1;margin:0 2px;animation:thinking-dot 1.2s ease-in-out infinite}
.mi-dot-2{animation-delay:.2s}
.mi-dot-3{animation-delay:.4s}

.mi-sel-card{padding:18px;border-radius:16px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);cursor:pointer;transition:all .22s cubic-bezier(.16,1,.3,1);text-align:left;font-family:'Syne',sans-serif}
.mi-sel-card:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14);transform:translateY(-2px)}
.mi-sel-card.selected{border-color:rgba(126,203,161,.4);background:rgba(126,203,161,.06)}

.mi-cat-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.mi-cat-row:last-child{border-bottom:none}

.mi-fb-item{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);animation:slide-in-right .45s cubic-bezier(.16,1,.3,1) both}

/* Real-time score bars */
.mi-rt-track{height:6px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}
.mi-rt-fill{height:100%;border-radius:999px;transition:width .15s cubic-bezier(.16,1,.3,1),background .3s ease}

/* Filler word highlight */
.mi-filler{background:rgba(203,168,126,.2);color:#cba87e;border-radius:3px;padding:0 2px;font-weight:700}

@media(max-width:1100px){.mi-3col{grid-template-columns:1fr 1fr !important}}
@media(max-width:760px){.mi-3col,.mi-2col{grid-template-columns:1fr !important}.mi-pad{padding:18px 16px !important}}
`;

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const GREEN  = "#7ecba1";
const ACCENT = {
  green: { base:"#7ecba1", dim:"rgba(126,203,161,.12)", border:"rgba(126,203,161,.25)" },
  blue:  { base:"#7eb5cb", dim:"rgba(126,181,203,.12)", border:"rgba(126,181,203,.25)" },
  rose:  { base:"#cb7e9a", dim:"rgba(203,126,154,.12)", border:"rgba(203,126,154,.25)" },
  amber: { base:"#cba87e", dim:"rgba(203,168,126,.12)", border:"rgba(203,168,126,.25)" },
};

const INTERVIEW_TYPES = [
  { id:"hr",      label:"HR Interview",      desc:"Behavioural & culture fit",   code:"HR", accent:ACCENT.green },
  { id:"tech",    label:"Technical Round",   desc:"DSA, system design concepts", code:"TE", accent:ACCENT.blue  },
  { id:"college", label:"College Entrance",  desc:"Aptitude & general questions",code:"CE", accent:ACCENT.amber },
  { id:"career",  label:"Career Counselling",desc:"Goals, strengths & growth",   code:"CC", accent:ACCENT.rose  },
];

const DIFFICULTY = [
  { id:"easy",   label:"Beginner",     sub:"Entry level"  },
  { id:"medium", label:"Intermediate", sub:"1–2 yrs exp"  },
  { id:"hard",   label:"Advanced",     sub:"Senior level" },
];

const ANSWER_TIME = 90;

/* ═══════════════════════════════════════════════════════════════════════════
   ML ENGINE  —  100% IN-BROWSER, ZERO API, ZERO HARDCODED ANSWERS
═══════════════════════════════════════════════════════════════════════════ */

/* ── Model loader with progress ─────────────────────────────────────────── */
const _pipes = {};
async function loadPipeline(task, model, onProg) {
  const k = `${task}::${model}`;
  if (_pipes[k]) return _pipes[k];
  onProg?.(`Downloading ${model.split("/")[1]}…`);
  const { pipeline, env } = await import(
    "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js"
  );
  env.useBrowserCache  = true;
  env.allowLocalModels = false;
  _pipes[k] = await pipeline(task, model, {
    progress_callback: p => {
      if (p.status === "progress" && p.progress != null)
        onProg?.(`Loading ${model.split("/")[1]}… ${Math.round(p.progress)}%`);
    },
  });
  return _pipes[k];
}

/* ── Question generation ────────────────────────────────────────────────── */
const Q_SEEDS = {
  hr: [
    "Describe a situation where you had to",
    "Tell me about a time when you demonstrated",
    "How do you approach situations where",
    "Give an example of how you handled",
    "What strategies do you use when facing",
    "Describe how you collaborated with others to",
    "Walk me through a moment when you had to",
    "How have you shown resilience when",
  ],
  tech: [
    "Explain the key differences between",
    "How would you design and implement",
    "Walk me through how you would optimise",
    "What approach would you take to debug",
    "Describe the architecture you would choose for",
    "What are the trade-offs when selecting",
    "How would you scale a system that needs",
    "Explain how you would test and validate",
  ],
  college: [
    "What motivated your decision to pursue",
    "Describe a project where you applied",
    "How do you manage competing priorities when",
    "What has been your most challenging experience with",
    "Describe a moment when you took initiative to",
    "How have you developed your skills in",
    "What did you learn from your experience with",
    "How do you prepare yourself for",
  ],
  career: [
    "Where do you see your career heading in terms of",
    "How do you plan to develop expertise in",
    "What type of impact do you want to create through",
    "Describe the work environment where you thrive and",
    "How do you intend to bridge the gap between",
    "What long-term goals drive your interest in",
    "How will you measure success in your career as",
    "What steps are you taking to become an expert in",
  ],
};

const DIFF_PARAMS = {
  easy:   { max_new_tokens:38, temperature:0.72, repetition_penalty:1.2 },
  medium: { max_new_tokens:52, temperature:0.88, repetition_penalty:1.3 },
  hard:   { max_new_tokens:68, temperature:0.95, repetition_penalty:1.4 },
};

async function generateInterviewQuestions(type, difficulty, onProg) {
  onProg?.("Loading question-generation model…");
  const pipe = await loadPipeline("text2text-generation", "Xenova/LaMini-Flan-T5-248M", onProg);
  const pool = Q_SEEDS[type] || Q_SEEDS.hr;
  const params = DIFF_PARAMS[difficulty] || DIFF_PARAMS.medium;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
  const questions = [];
  for (let i = 0; i < 5; i++) {
    onProg?.(`Generating question ${i + 1} / 5…`);
    const prompt = `Generate one interview question for a ${type} interview at ${difficulty} difficulty starting with: "${shuffled[i]}"`;
    const out = await pipe(prompt, { ...params, do_sample: true, num_return_sequences: 1 });
    let q = (out[0]?.generated_text || shuffled[i] + "...").trim();
    q = q.replace(/^generate.*?question[:\s]*/i, "").trim();
    if (!q.endsWith("?")) q = q.replace(/[.,;:!]*$/, "") + "?";
    q = q.charAt(0).toUpperCase() + q.slice(1);
    questions.push(q);
  }
  return questions;
}

/* ═══════════════════════════════════════════════════════════════════════════
   REAL-TIME NLP ENGINE
   Runs synchronously on every speech interim event — ~0ms latency
   12 linguistic signals extracted per call
═══════════════════════════════════════════════════════════════════════════ */

const FILLERS = new Set([
  "um","uh","er","ah","like","you know","basically","literally","actually",
  "so","right","okay","kind of","sort of","i mean","well",
]);
const EVIDENCE = [
  "for example","for instance","specifically","such as","because","therefore",
  "however","although","as a result","which led to","demonstrated","achieved",
  "improved","increased","reduced","helped","enabled","consequently",
  "furthermore","additionally","in contrast","on the other hand","resulted in",
];
const HEDGES = [
  "maybe","perhaps","probably","possibly","might","could","sort of","kind of",
  "i think","i guess","i suppose","not sure","a bit","somewhat","fairly",
];
const POWER_WORDS = [
  "led","created","built","delivered","achieved","improved","drove","launched",
  "designed","developed","managed","implemented","coordinated","established",
  "transformed","solved","optimised","streamlined","pioneered","spearheaded",
];

function scoreRealTime(text, question, elapsedSec = 1, rmsLevel = 50) {
  if (!text || text.length < 3)
    return { clarity:45, confidence:45, relevance:45, depth:45, signals:{wc:0,sc:0,wpm:0,fillerCount:0,evidenceCount:0,hedgeCount:0,powerCount:0,qHits:0,fillerPositions:[]} };

  const lower   = text.toLowerCase();
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const words   = rawWords.map(w => w.toLowerCase().replace(/[^a-z]/g, ""));
  const wc      = words.length;
  const sents   = text.split(/[.!?]+/).filter(s => s.trim().length > 4);
  const sc      = sents.length || 1;

  // S1: Word velocity (WPM)
  const wpm = (wc / Math.max(elapsedSec, 1)) * 60;
  const velScore = wpm >= 80 && wpm <= 180 ? 1.0 : wpm < 80 ? wpm / 80 : Math.max(0, 1 - (wpm - 180) / 200);

  // S2: Lexical diversity
  const uniq = new Set(words.filter(w => w.length > 2));
  const lexDiv = uniq.size / Math.max(wc, 1);

  // S3: Filler detection (word + bigram)
  let fillerCount = 0;
  const fillerPositions = [];
  rawWords.forEach((w, i) => {
    if (FILLERS.has(w.toLowerCase().replace(/[^a-z]/g,""))) { fillerCount++; fillerPositions.push(i); }
  });
  for (let i = 0; i < rawWords.length - 1; i++) {
    if (FILLERS.has(rawWords[i].toLowerCase() + " " + rawWords[i+1].toLowerCase())) fillerCount++;
  }
  const fillerRate = fillerCount / Math.max(wc, 1);

  // S4: Question keyword overlap
  const qWords = new Set(
    question.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).filter(w => w.length > 3)
  );
  const qHits = words.filter(w => qWords.has(w)).length;
  const relRatio = Math.min(1, qHits / Math.max(qWords.size * 0.4, 1));

  // S5: Evidence markers
  const evidenceCount = EVIDENCE.filter(m => lower.includes(m)).length;

  // S6: Average sentence length
  const avgSL = wc / sc;
  const slScore = avgSL >= 8 && avgSL <= 22 ? 1.0 : avgSL < 8 ? avgSL / 8 : Math.max(0, 1 - (avgSL - 22) / 30);

  // S7: Hedge words
  const hedgeCount = HEDGES.filter(h => lower.includes(h)).length;

  // S8: Power words
  const powerCount = POWER_WORDS.filter(p => lower.includes(p)).length;

  // S9: Coherence (trigram variety)
  let coherence = 0.5;
  if (wc >= 9) {
    const tri = new Set();
    for (let i = 0; i < words.length - 2; i++) tri.add(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    coherence = Math.min(1, tri.size / (words.length - 2));
  }

  // S10: Vocal energy
  const energyScore = rmsLevel > 8 ? Math.min(1, rmsLevel / 60) : 0.4;

  // S11: Answer length progress
  const lengthProg = Math.min(1, wc / 60);

  // S12: Sentence completion
  const sentComp = Math.min(1, sc / Math.max(Math.floor(wc / 12), 1));

  // ── COMPOSE SCORES ───────────────────────────────────────────────────────
  const clamp = (v) => Math.round(Math.min(95, Math.max(45, v)));

  const clarity = clamp(
    48 + velScore * 12 + lexDiv * 14 + slScore * 10 + sentComp * 8 - fillerRate * 28 + (wc > 20 ? 5 : 0)
  );
  const confidence = clamp(
    50 + energyScore * 15 + powerCount * 6 - hedgeCount * 5 - fillerRate * 18 + (wc > 30 ? 6 : 0)
  );
  const relevance = clamp(
    48 + relRatio * 30 + evidenceCount * 4 + sentComp * 10 + coherence * 10 + (qHits > 2 ? 5 : 0)
  );
  const depth = clamp(
    45 + lengthProg * 22 + evidenceCount * 5 + lexDiv * 12 + coherence * 8 + (sc >= 3 ? 6 : 0) + (sc >= 5 ? 4 : 0)
  );

  return {
    clarity, confidence, relevance, depth,
    signals: { wc, sc, wpm:Math.round(wpm), fillerCount, evidenceCount, hedgeCount, powerCount, qHits, fillerPositions },
  };
}

function getLiveTip(sig, scores) {
  const { wpm, fillerCount, evidenceCount, hedgeCount, powerCount, wc, qHits } = sig;
  if (wc < 8)          return { icon:"🎤", text:"Keep going — say more!", color:ACCENT.amber.base };
  if (fillerCount >= 3) return { icon:"✋", text:`${fillerCount} filler words — try pausing instead`, color:ACCENT.amber.base };
  if (hedgeCount >= 3)  return { icon:"💪", text:"Sound more confident — cut the hedging", color:ACCENT.rose.base };
  if (scores.relevance < 55 && qHits === 0) return { icon:"🎯", text:"Tie your answer back to the question", color:ACCENT.rose.base };
  if (evidenceCount === 0 && wc > 30)       return { icon:"📌", text:"Add a specific example or result", color:ACCENT.blue.base };
  if (wpm > 195)       return { icon:"🐢", text:"Slow down a little", color:ACCENT.amber.base };
  if (wpm < 65 && wc > 15) return { icon:"⚡", text:"Pick up the pace slightly", color:ACCENT.blue.base };
  if (scores.depth < 60 && wc > 40) return { icon:"🔍", text:"Go deeper — explain the 'why'", color:ACCENT.blue.base };
  if (powerCount > 0)  return { icon:"⭐", text:"Strong action words — keep it up!", color:GREEN };
  if (evidenceCount > 0) return { icon:"✅", text:"Good use of examples!", color:GREEN };
  if (scores.clarity >= 75) return { icon:"💎", text:"Clear and well-structured so far", color:GREEN };
  return { icon:"🎙️", text:"Listening and scoring…", color:"rgba(232,230,223,.35)" };
}

/* ── Deep final evaluation (post-submit, adds DistilBERT) ───────────────── */
async function deepEvaluate(question, answer, type, onProg) {
  onProg?.("Running deep evaluation…");
  const base = scoreRealTime(answer, question, 90, 55);
  let sentBoost = 0;
  try {
    const pipe = await loadPipeline(
      "text-classification",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      onProg
    );
    onProg?.("Analysing tone & sentiment…");
    const r = await pipe(answer.slice(0, 512));
    const isPos = r[0]?.label === "POSITIVE";
    sentBoost = isPos ? Math.round((r[0]?.score ?? 0.5) * 12) : -Math.round((r[0]?.score ?? 0.5) * 6);
  } catch (_) {}

  const clamp = v => Math.round(Math.min(95, Math.max(45, v)));
  const sig = base.signals;
  const parts = [];

  if (sig.fillerCount > 2)
    parts.push(`You used ${sig.fillerCount} filler words — replace them with deliberate pauses.`);
  else if (base.clarity >= 72)
    parts.push("Your answer was clearly structured and easy to follow.");
  else
    parts.push("Work on cleaner sentence structure for better impact.");

  if (sig.evidenceCount > 0)
    parts.push(`Good use of ${sig.evidenceCount} concrete example${sig.evidenceCount > 1 ? "s" : ""}.`);
  else if (sig.wc < 30)
    parts.push("Your answer was brief — expand with at least one real example.");
  else
    parts.push("Back up your points with specific examples or outcomes next time.");

  if (sig.hedgeCount > 2)
    parts.push(`${sig.hedgeCount} hedge words detected — commit to your statements more firmly.`);
  else if (sig.powerCount > 0)
    parts.push(`Strong active vocabulary — ${sig.powerCount} power word${sig.powerCount > 1 ? "s" : ""} used.`);

  if (base.relevance < 60)
    parts.push("Align your answer more closely with the specific question asked.");

  return {
    scores: {
      Clarity:    clamp(base.clarity),
      Confidence: clamp(base.confidence + sentBoost),
      Relevance:  clamp(base.relevance),
      Depth:      clamp(base.depth),
    },
    feedback: parts.slice(0, 2).join(" "),
    signals: sig,
  };
}

/* ─────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────── */
function SLabel({ children, accent = GREEN }) {
  return <div className="mi-label" style={{ color: accent }}>{children}</div>;
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
  return <span><span className="mi-dot-1"/><span className="mi-dot-2"/><span className="mi-dot-3"/></span>;
}

function RealMicBars({ level = 0, active = false, color = GREEN }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, height:28 }}>
      {Array.from({ length:12 }, (_, i) => {
        const lit = active && level > (i / 12) * 100;
        const h = 4 + Math.round(Math.sin((i / 11) * Math.PI) * 22);
        return <div key={i} style={{ width:3, height:lit?h:4, borderRadius:2, background:lit?color:"rgba(255,255,255,.08)", transition:"height .06s ease, background .1s ease" }}/>;
      })}
    </div>
  );
}

function LiveScoreBar({ label, icon, score, accent, live }) {
  const color = score >= 75 ? accent.base : score >= 58 ? ACCENT.amber.base : ACCENT.rose.base;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:22, height:22, borderRadius:7, background:accent.dim, border:`1px solid ${accent.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, color:accent.base }}>{icon}</span>
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.55)" }}>{label}</span>
          {live && <div className="mi-blink" style={{ width:4, height:4, borderRadius:"50%", background:GREEN }}/>}
        </div>
        <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, color, filter:`drop-shadow(0 0 5px ${color}50)`, transition:"all .15s ease" }}>
          {Math.round(score)}
        </span>
      </div>
      <div className="mi-rt-track">
        <div className="mi-rt-fill" style={{ width:`${Math.round(score)}%`, background:`linear-gradient(90deg,${color}60,${color})` }}/>
      </div>
    </div>
  );
}

function AnnotatedTranscript({ text, fillerPositions = [] }) {
  if (!text) return <span style={{ color:"rgba(232,230,223,.3)", fontStyle:"italic" }}>Listening… start speaking</span>;
  const posSet = new Set(fillerPositions);
  const parts = text.split(/(\s+)/);
  let wi = 0;
  return (
    <span>
      {parts.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
        const isF = posSet.has(wi++);
        return isF ? <span key={i} className="mi-filler">{tok}</span> : <span key={i}>{tok}</span>;
      })}
    </span>
  );
}

function RingScore({ score, size = 80, stroke = 5, accent = GREEN }) {
  const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent+"22"} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1.8s cubic-bezier(.16,1,.3,1)", filter:`drop-shadow(0 0 6px ${accent}70)` }}/>
    </svg>
  );
}

function TimerRing({ timeLeft, total = ANSWER_TIME, size = 52 }) {
  const r = (size - 6) / 2, circ = 2 * Math.PI * r, off = circ * (1 - timeLeft / total);
  const col = timeLeft <= 10 ? ACCENT.rose.base : timeLeft <= 30 ? ACCENT.amber.base : GREEN;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset .5s linear, stroke .5s ease", filter:`drop-shadow(0 0 4px ${col}60)` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:500, color:col }}>{timeLeft}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SETUP SCREEN
───────────────────────────────────────── */
function SetupScreen({ onStart }) {
  const [type,        setType]        = useState("hr");
  const [difficulty,  setDifficulty]  = useState("medium");
  const [camReady,    setCamReady]    = useState(false);
  const [camError,    setCamError]    = useState(false);
  const [micLevel,    setMicLevel]    = useState(0);
  const [generatingQ, setGeneratingQ] = useState(false);
  const [mlStatus,    setMlStatus]    = useState("");
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const animRef     = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video:true, audio:{ echoCancellation:true, noiseSuppression:true } })
      .then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamReady(true);
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(s);
        const an  = ctx.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.6;
        src.connect(an); analyserRef.current = an;
        const tick = () => {
          const buf = new Float32Array(an.frequencyBinCount);
          an.getFloatFrequencyData(buf);
          const rms = Math.sqrt(buf.reduce((s,v)=>s+v*v,0)/buf.length);
          setMicLevel(Math.min(100, Math.round(rms * 2.2)));
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => setCamError(true));
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
      <div className="mi-fade-up">
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ position:"relative", width:8, height:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
            <div className="mi-ping" style={{ width:8, height:8, borderRadius:"50%", background:GREEN, position:"absolute" }}/>
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>AI Interview Studio</span>
        </div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,3.5vw,48px)", fontWeight:800, lineHeight:1, letterSpacing:"-.04em", color:"#f0ede6", margin:0 }}>
          Prepare to{" "}
          <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:GREEN }}>impress.</span>
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
          <div style={{ height:1, width:20, background:`linear-gradient(90deg,${GREEN},transparent)` }}/>
          <span style={{ fontSize:13, color:"rgba(232,230,223,.35)", fontWeight:600 }}>Live mic · In-browser ML · Zero data sent to any server</span>
        </div>
      </div>

      <div className="mi-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          <div className="mi-fade-up mi-card" style={{ animationDelay:".08s" }}>
            <div className="mi-card-inner">
              <SLabel>Interview Type</SLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {INTERVIEW_TYPES.map(t => (
                  <button key={t.id} className={`mi-sel-card ${type===t.id?"selected":""}`}
                    onClick={() => setType(t.id)}
                    style={{ borderColor:type===t.id?t.accent.border:undefined, background:type===t.id?t.accent.dim:undefined }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <div style={{ width:30, height:30, borderRadius:9, background:t.accent.dim, border:`1px solid ${t.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:500, color:t.accent.base }}>{t.code}</span>
                      </div>
                      {type===t.id && (
                        <div style={{ marginLeft:"auto", width:16, height:16, borderRadius:"50%", background:t.accent.base, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#0c2018" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#f0ede6", marginBottom:2 }}>{t.label}</div>
                    <div style={{ fontSize:11, color:"rgba(232,230,223,.35)", fontWeight:500 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mi-fade-up mi-card" style={{ animationDelay:".14s" }}>
            <div className="mi-card-inner">
              <SLabel>Difficulty</SLabel>
              <div style={{ display:"flex", gap:8 }}>
                {DIFFICULTY.map(d => (
                  <button key={d.id} onClick={() => setDifficulty(d.id)} style={{
                    flex:1, padding:"12px 8px", borderRadius:12, cursor:"pointer",
                    border:`1.5px solid ${difficulty===d.id?"rgba(126,203,161,.4)":"rgba(255,255,255,.07)"}`,
                    background:difficulty===d.id?"rgba(126,203,161,.08)":"rgba(255,255,255,.025)",
                    fontFamily:"'Syne',sans-serif", transition:"all .22s", textAlign:"center",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:difficulty===d.id?GREEN:"#f0ede6", marginBottom:2 }}>{d.label}</div>
                    <div style={{ fontSize:10, color:"rgba(232,230,223,.3)", fontWeight:500 }}>{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mi-fade-up mi-card" style={{ animationDelay:".18s", background:"rgba(126,203,161,.03)", borderColor:"rgba(126,203,161,.12)" }}>
            <div className="mi-card-inner">
              <SLabel>What happens</SLabel>
              {[
                ["5 Q's", "Generated by T5 model — never hardcoded"],
                ["LIVE",  "12 NLP signals scored on every word"],
                ["RMS",   "Real mic energy via AudioContext fftSize:1024"],
                ["Deep",  "DistilBERT sentiment eval after submit"],
              ].map(([c, d]) => (
                <div key={c} style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:ACCENT.green.dim, border:`1px solid ${ACCENT.green.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, color:GREEN }}>{c}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:"rgba(232,230,223,.55)" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="mi-fade-up mi-card" style={{ animationDelay:".1s" }}>
            <div className="mi-card-inner">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <SLabel>Camera & Mic</SLabel>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
                  <div className="mi-blink" style={{ width:7, height:7, borderRadius:"50%", background:camReady?GREEN:ACCENT.rose.base }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:camReady?GREEN:ACCENT.rose.base }}>
                    {camReady?"Ready":camError?"Access denied":"Connecting…"}
                  </span>
                </div>
              </div>
              {camError ? (
                <div style={{ padding:"30px 20px", border:"1px dashed rgba(255,255,255,.1)", borderRadius:14, textAlign:"center" }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"rgba(232,230,223,.4)", marginBottom:12 }}>Camera access needed</p>
                  <button className="mi-btn-ghost" style={{ width:"auto", padding:"10px 24px" }} onClick={() => window.location.reload()}>Retry</button>
                </div>
              ) : (
                <>
                  <div className={`mi-video-wrap ${camReady?"active":""}`}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", display:"block", aspectRatio:"4/3", objectFit:"cover", background:"#060608", transform:"scaleX(-1)" }}/>
                    {camReady && (
                      <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,.6)", backdropFilter:"blur(8px)", border:"1px solid rgba(126,203,161,.25)", borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:6 }}>
                        <div className="mi-blink" style={{ width:5, height:5, borderRadius:"50%", background:GREEN }}/>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:GREEN, letterSpacing:".1em" }}>LIVE PREVIEW</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop:12, padding:"10px 14px", borderRadius:12, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".08em" }}>MIC · RMS</span>
                    <RealMicBars level={micLevel} active={micLevel > 8} color={GREEN} />
                    <span style={{ fontSize:10, fontWeight:700, color:micLevel>8?GREEN:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>{micLevel > 8 ? `${micLevel}` : "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mi-fade-up" style={{ animationDelay:".22s" }}>
            <button className="mi-btn-primary" disabled={!camReady || generatingQ}
              onClick={async () => {
                setGeneratingQ(true); setMlStatus("Initialising ML engine…");
                try {
                  const qs = await generateInterviewQuestions(type, difficulty, m => setMlStatus(m));
                  onStart({ type, difficulty, questions: qs });
                } catch {
                  setMlStatus("Retrying…");
                  try {
                    const qs = await generateInterviewQuestions(type, "easy", m => setMlStatus(m));
                    onStart({ type, difficulty, questions: qs });
                  } catch { setMlStatus("Model unavailable — check your connection."); }
                } finally { setGeneratingQ(false); setMlStatus(""); }
              }}>
              {generatingQ ? (mlStatus || "Loading ML model…") : camReady ? "Start Interview →" : "Waiting for camera…"}
            </button>
            {mlStatus && (
              <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:10 }}>
                <ThinkingDots/>
                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:GREEN }}>{mlStatus}</span>
              </div>
            )}
            <p style={{ fontSize:11, color:"rgba(232,230,223,.18)", textAlign:"center", marginTop:10, lineHeight:1.6 }}>
              All ML runs in your browser. Nothing is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INTERVIEW SCREEN
───────────────────────────────────────── */
function InterviewScreen({ config, onComplete }) {
  const { questions, type } = config;
  const [qIdx,        setQIdx]        = useState(0);
  const [phase,       setPhase]       = useState("question");
  const [timeLeft,    setTimeLeft]    = useState(ANSWER_TIME);
  const [transcript,  setTranscript]  = useState([]);
  const [feedbacks,   setFeedbacks]   = useState([]);
  const [camReady,    setCamReady]    = useState(false);
  const [liveCaption, setLiveCaption] = useState("");
  const [micLevel,    setMicLevel]    = useState(0);
  const [sttError,    setSttError]    = useState(null);
  const [mlStatus,    setMlStatus]    = useState("");
  const [wordCount,   setWordCount]   = useState(0);
  const [typedAnswer, setTypedAnswer] = useState(""); // fallback typed input

  // Real-time ML scores — updated on every interim speech event AND every animation frame
  const [rtS, setRtS] = useState({ clarity:45, confidence:45, relevance:45, depth:45 });
  const [rtSig, setRtSig] = useState({ wc:0, sc:0, wpm:0, fillerCount:0, evidenceCount:0, hedgeCount:0, powerCount:0, qHits:0, fillerPositions:[] });
  const [rtTip, setRtTip] = useState(null);

  const videoRef       = useRef(null);
  const streamRef      = useRef(null);
  const timerRef       = useRef(null);
  const recognizerRef  = useRef(null);
  const finalTextRef   = useRef("");
  const captionRef     = useRef("");   // mirror for rAF callback
  const analyserRef    = useRef(null);
  const animRef        = useRef(null);
  const startTimeRef   = useRef(null);
  const rmsRef         = useRef(50);

  const typeInfo = INTERVIEW_TYPES.find(t => t.id === type) || INTERVIEW_TYPES[0];
  const isAnswering = phase === "answering";

  /* ── Mic + Camera ── */
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video:true, audio:{ echoCancellation:true, noiseSuppression:true, sampleRate:44100 } })
      .then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamReady(true);
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaStreamSource(s);
        const an  = ctx.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.55;
        src.connect(an); analyserRef.current = an;
      }).catch(() => {});
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current); clearInterval(chunkIntervalRef.current);
      cancelAnimationFrame(animRef.current);
      isRecordingRef.current = false;
      if (mediaRecorderRef.current) try { mediaRecorderRef.current.stop(); } catch(_) {}
    };
  }, []);

  /* ── 60fps loop: mic level + real-time scoring on every frame ── */
  const startLoop = useCallback((qIdxSnapshot) => {
    const tick = () => {
      if (analyserRef.current) {
        const buf = new Float32Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getFloatFrequencyData(buf);
        const rms = Math.sqrt(buf.slice(0, buf.length / 2).reduce((s,v) => s+v*v, 0) / (buf.length / 2));
        const lvl = Math.min(100, Math.round(rms * 2.2));
        setMicLevel(lvl);
        rmsRef.current = rmsRef.current * 0.92 + lvl * 0.08;

        // Score update every frame — uses latest captionRef
        const txt = captionRef.current;
        if (txt && txt.length > 4 && startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const sc = scoreRealTime(txt, questions[qIdxSnapshot], elapsed, rmsRef.current);
          setRtS({ clarity:sc.clarity, confidence:sc.confidence, relevance:sc.relevance, depth:sc.depth });
          setRtSig(sc.signals || {});
          setRtTip(getLiveTip(sc.signals || {}, sc));
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [questions]);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    setMicLevel(0);
  }, []);

  /* ══════════════════════════════════════════════════════════════════
     IN-BROWSER WHISPER STT  —  Xenova/whisper-tiny (WASM, no server)
     Strategy:
       1. MediaRecorder captures mic audio into 4-second chunks (webm/ogg)
       2. Each chunk → AudioContext.decodeAudioData → Float32 PCM @ 16kHz
       3. Whisper pipeline transcribes the PCM chunk → appended to transcript
       4. Real-time NLP scoring runs after every transcription
       5. Typed fallback textarea always visible so user can type if needed
  ══════════════════════════════════════════════════════════════════ */
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const whisperRef       = useRef(null);          // cached Whisper pipeline
  const isRecordingRef   = useRef(false);
  const chunkIntervalRef = useRef(null);

  // Pre-load Whisper as soon as InterviewScreen mounts (background download)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { pipeline, env } = await import(
          "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js"
        );
        env.useBrowserCache = true; env.allowLocalModels = false;
        const pipe = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny", {
          progress_callback: p => {
            if (!cancelled && p.status === "progress" && p.progress != null)
              setSttError(`Loading Whisper… ${Math.round(p.progress)}%`);
          },
        });
        if (!cancelled) { whisperRef.current = pipe; setSttError(null); }
      } catch { if (!cancelled) setSttError(null); /* fail silently — typed fallback available */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Convert a Blob of webm/ogg audio → Float32Array PCM @ 16 kHz
  const blobToPCM16k = useCallback(async (blob) => {
    const arrayBuf = await blob.arrayBuffer();
    // Try 16kHz first (ideal for Whisper), fall back to default
    let ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    } catch {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const decoded = await ctx.decodeAudioData(arrayBuf);
    ctx.close();
    // Mix down to mono
    const mono = new Float32Array(decoded.length);
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const channel = decoded.getChannelData(ch);
      for (let i = 0; i < decoded.length; i++) mono[i] += channel[i];
    }
    for (let i = 0; i < mono.length; i++) mono[i] /= decoded.numberOfChannels;
    return mono;
  }, []);

  // Transcribe one audio Blob using Whisper and append result to transcript
  const transcribeChunk = useCallback(async (blob, qIdxSnapshot) => {
    if (!whisperRef.current || blob.size < 1000) return;
    try {
      const pcm = await blobToPCM16k(blob);
      const result = await whisperRef.current(pcm, { language: "english", task: "transcribe" });
      const newText = (result?.text || "").trim();
      if (!newText) return;

      finalTextRef.current += (finalTextRef.current ? " " : "") + newText;
      const combined = finalTextRef.current;
      captionRef.current = combined;
      setLiveCaption(combined);
      setWordCount(combined.trim().split(/\s+/).filter(Boolean).length);
      setSttError(null);

      // Immediate NLP scoring on every transcription
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const sc = scoreRealTime(combined, questions[qIdxSnapshot], elapsed, rmsRef.current);
        setRtS({ clarity:sc.clarity, confidence:sc.confidence, relevance:sc.relevance, depth:sc.depth });
        setRtSig(sc.signals || {});
        setRtTip(getLiveTip(sc.signals || {}, sc));
      }
    } catch (_) { /* chunk decode failed — skip silently */ }
  }, [blobToPCM16k, questions]);

  const startSTT = useCallback((qIdxSnapshot) => {
    finalTextRef.current = ""; captionRef.current = "";
    setLiveCaption(""); isRecordingRef.current = true;

    if (!whisperRef.current) {
      setSttError("Whisper loading… type your answer below while you wait.");
    } else {
      setSttError(null);
    }

    // Get a dedicated audio-only stream for MediaRecorder
    // (avoids issues with reusing the video+audio stream)
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false })
      .then(audioStream => {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus") ? "audio/ogg;codecs=opus"
          : "";

        const mr = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});
        mediaRecorderRef.current = mr;
        audioChunksRef.current = [];

        mr.ondataavailable = e => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };

        mr.onstop = async () => {
          // Stop the dedicated audio stream tracks when done
          if (!isRecordingRef.current) {
            audioStream.getTracks().forEach(t => t.stop());
          }
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
            audioChunksRef.current = [];
            await transcribeChunk(blob, qIdxSnapshot);
          }
          // Restart if still recording
          if (isRecordingRef.current) {
            try { mr.start(); } catch (_) {}
          }
        };

        mr.onerror = () => setSttError("Mic recording error — type your answer below.");
        mr.start();

        // Flush every 4 seconds
        chunkIntervalRef.current = setInterval(() => {
          if (!isRecordingRef.current) return;
          if (mr.state === "recording") mr.stop();
        }, 4000);

        recognizerRef.current = mr;
      })
      .catch(() => {
        setSttError("Mic access denied — please type your answer below.");
      });
  }, [transcribeChunk]);

  const stopSTT = useCallback(() => {
    isRecordingRef.current = false;
    clearInterval(chunkIntervalRef.current);
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop(); // onstop will clean up audio stream
        }
      } catch(_) {}
      mediaRecorderRef.current = null;
    }
    recognizerRef.current = null;
  }, []);

  const startAnswering = useCallback(() => {
    setPhase("answering"); setTimeLeft(ANSWER_TIME);
    setLiveCaption(""); setWordCount(0); setTypedAnswer("");
    setRtS({ clarity:45, confidence:45, relevance:45, depth:45 });
    setRtSig({}); setRtTip(null);
    finalTextRef.current = ""; captionRef.current = "";
    startTimeRef.current = Date.now(); rmsRef.current = 50;
    startSTT(qIdx); startLoop(qIdx);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitAnswer(); return 0; } return t - 1; });
    }, 1000);
  }, [qIdx, startSTT, startLoop]); // eslint-disable-line

  const submitAnswer = useCallback(async () => {
    clearInterval(timerRef.current); stopSTT(); stopLoop();
    setPhase("thinking"); setMlStatus("Running deep evaluation…");

    // Merge Whisper transcript + any typed text
    const whisperText = (finalTextRef.current || captionRef.current || "").trim();
    const combined = [whisperText, typedAnswer.trim()].filter(Boolean).join(" ").trim();
    const answer = combined.length > 8 ? combined : "(No answer provided — please type or speak your response.)";

    setLiveCaption(""); setWordCount(0);
    setTranscript(prev => [...prev, { role:"user", text:answer }]);

    try {
      const ev = await deepEvaluate(questions[qIdx], answer, type, m => setMlStatus(m));
      const cats = ["Clarity","Confidence","Relevance","Depth"];
      const icons = ["CL","CF","RE","DE"];
      const accents = [ACCENT.green, ACCENT.blue, ACCENT.amber, ACCENT.rose];
      const fb = cats.map((cat, i) => ({
        cat, icon:icons[i], accent:accents[i],
        score: ev.scores?.[cat] ?? 60,
        comment: ev.feedback,
      }));
      setFeedbacks(prev => [...prev, fb]);
      setTranscript(prev => [...prev, { role:"ai", text:ev.feedback }]);
      setRtS({ clarity:ev.scores.Clarity, confidence:ev.scores.Confidence, relevance:ev.scores.Relevance, depth:ev.scores.Depth });
    } catch {
      const sc = scoreRealTime(answer, questions[qIdx], 60, 55);
      const cats = ["Clarity","Confidence","Relevance","Depth"];
      const icons = ["CL","CF","RE","DE"];
      const accents = [ACCENT.green, ACCENT.blue, ACCENT.amber, ACCENT.rose];
      const scores = [sc.clarity, sc.confidence, sc.relevance, sc.depth];
      const msg = sc.signals?.wc < 20 ? "Expand your answer with a concrete example."
        : "Good effort — back it up with specific results next time.";
      const fb = cats.map((cat, i) => ({ cat, icon:icons[i], accent:accents[i], score:scores[i], comment:msg }));
      setFeedbacks(prev => [...prev, fb]);
      setTranscript(prev => [...prev, { role:"ai", text:msg }]);
    }
    setMlStatus(""); setPhase("next");
  }, [qIdx, questions, type, stopSTT, stopLoop]); // eslint-disable-line

  const nextQuestion = useCallback(() => {
    if (qIdx >= questions.length - 1) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      onComplete({ transcript, feedbacks, questions });
    } else {
      setQIdx(i => i + 1); setPhase("question"); setTimeLeft(ANSWER_TIME);
      setLiveCaption(""); setWordCount(0); setTypedAnswer("");
      setRtS({ clarity:45, confidence:45, relevance:45, depth:45 });
      setRtSig({}); setRtTip(null);
      captionRef.current = ""; finalTextRef.current = "";
    }
  }, [qIdx, questions, transcript, feedbacks, onComplete]);

  const curFb = feedbacks[feedbacks.length - 1] || null;
  const overall = Math.round((rtS.clarity + rtS.confidence + rtS.relevance + rtS.depth) / 4);
  const overallColor = overall >= 70 ? GREEN : overall >= 55 ? ACCENT.amber.base : ACCENT.rose.base;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Top bar */}
      <div className="mi-fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:typeInfo.accent.base, boxShadow:`0 0 6px ${typeInfo.accent.base}` }}/>
            <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>{typeInfo.label}</span>
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#f0ede6", letterSpacing:"-.03em" }}>
            Question <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", color:GREEN }}>{qIdx+1}</span>
            <span style={{ color:"rgba(232,230,223,.25)", fontWeight:400 }}> / {questions.length}</span>
          </h2>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {questions.map((_,i) => (
            <div key={i} style={{ width:i===qIdx?24:8, height:8, borderRadius:4, background:i<=qIdx?GREEN:"rgba(255,255,255,.12)", opacity:i>qIdx?.35:1, transition:"all .3s", boxShadow:i===qIdx?`0 0 8px ${GREEN}60`:"none" }}/>
          ))}
        </div>
      </div>

      {/* 3-column grid */}
      <div className="mi-3col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.3fr", gap:18, alignItems:"start" }}>

        {/* COL 1 — Video */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className={`mi-video-wrap ${isAnswering?"recording":camReady?"active":""}`}>
            <video ref={videoRef} autoPlay muted playsInline
              style={{ width:"100%", display:"block", aspectRatio:"4/3", objectFit:"cover", background:"#060608", transform:"scaleX(-1)" }}/>
            {isAnswering && (
              <>
                <div style={{ position:"absolute", top:10, left:10, background:"rgba(203,126,154,.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(203,126,154,.3)", borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                  <div className="mi-blink" style={{ width:5, height:5, borderRadius:"50%", background:ACCENT.rose.base }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:ACCENT.rose.base }}>REC</span>
                </div>
                <div style={{ position:"absolute", bottom:10, right:10 }}><TimerRing timeLeft={timeLeft}/></div>
              </>
            )}
            {phase === "thinking" && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(12,12,15,.75)", backdropFilter:"blur(4px)" }}>
                <div style={{ textAlign:"center" }}>
                  <ThinkingDots/>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.4)", marginTop:10, fontFamily:"'JetBrains Mono',monospace" }}>{mlStatus || "Analysing…"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Mic level */}
          <div style={{ padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:9, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".08em" }}>MIC·RMS</span>
            <RealMicBars level={micLevel} active={isAnswering} color={ACCENT.rose.base}/>
            <span style={{ fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:isAnswering?ACCENT.rose.base:"rgba(232,230,223,.2)" }}>
              {isAnswering ? micLevel : "—"}
            </span>
          </div>

          {sttError && (
            <div style={{ padding:"9px 12px", borderRadius:10, background:"rgba(203,168,126,.08)", border:"1px solid rgba(203,168,126,.2)", fontSize:11, color:ACCENT.amber.base, lineHeight:1.5 }}>
              {sttError}
            </div>
          )}

          {/* Controls */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {phase === "question"  && <button className="mi-btn-primary" onClick={startAnswering}>Start Answering →</button>}
            {isAnswering && (
              <button onClick={submitAnswer} style={{ padding:"12px 0", borderRadius:14, border:`1px solid ${ACCENT.rose.border}`, background:ACCENT.rose.dim, color:ACCENT.rose.base, fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, letterSpacing:".05em", textTransform:"uppercase", cursor:"pointer", width:"100%", transition:"all .2s" }}>
                Done — Submit
              </button>
            )}
            {phase === "thinking"  && <button className="mi-btn-primary" disabled><ThinkingDots/></button>}
            {phase === "next"      && <button className="mi-btn-primary" onClick={nextQuestion}>{qIdx>=questions.length-1?"View Report →":"Next Question →"}</button>}
          </div>
        </div>

        {/* COL 2 — Live scores */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="mi-card" style={{ borderColor:isAnswering?"rgba(126,203,161,.22)":"rgba(255,255,255,.08)", transition:"border-color .4s" }}>
            <div className="mi-card-inner">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <SLabel style={{ margin:0 }}>Live Scores</SLabel>
                {isAnswering && (
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div className="mi-blink" style={{ width:5, height:5, borderRadius:"50%", background:GREEN }}/>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color:GREEN, letterSpacing:".1em" }}>LIVE</span>
                  </div>
                )}
              </div>

              <LiveScoreBar label="Clarity"    icon="CL" score={rtS.clarity}    accent={ACCENT.green} live={isAnswering}/>
              <LiveScoreBar label="Confidence" icon="CF" score={rtS.confidence} accent={ACCENT.blue}  live={isAnswering}/>
              <LiveScoreBar label="Relevance"  icon="RE" score={rtS.relevance}  accent={ACCENT.amber} live={isAnswering}/>
              <LiveScoreBar label="Depth"      icon="DE" score={rtS.depth}      accent={ACCENT.rose}  live={isAnswering}/>

              <div style={{ paddingTop:12, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".08em" }}>OVERALL</span>
                <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:30, color:overallColor, filter:`drop-shadow(0 0 8px ${overallColor}40)`, transition:"all .15s" }}>
                  {overall}
                </span>
              </div>

              {/* Live tip */}
              {rtTip && (isAnswering || phase === "next") && (
                <div style={{ marginTop:12, padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:13, flexShrink:0 }}>{rtTip.icon}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:rtTip.color, lineHeight:1.55 }}>{rtTip.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signal diagnostics */}
          {isAnswering && rtSig.wc > 0 && (
            <div className="mi-card">
              <div className="mi-card-inner" style={{ padding:16 }}>
                <SLabel>NLP Signals</SLabel>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {[
                    { k:"Words",    v:rtSig.wc },
                    { k:"WPM",      v:rtSig.wpm },
                    { k:"Fillers",  v:rtSig.fillerCount,  warn:rtSig.fillerCount > 2 },
                    { k:"Evidence", v:rtSig.evidenceCount, good:rtSig.evidenceCount > 0 },
                    { k:"Power",    v:rtSig.powerCount,   good:rtSig.powerCount > 0 },
                    { k:"Q-hits",   v:rtSig.qHits,        good:rtSig.qHits > 1 },
                  ].map(({ k, v, warn, good }) => (
                    <div key={k} style={{ padding:"6px 9px", borderRadius:8, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:"rgba(232,230,223,.25)", marginBottom:2 }}>{k}</div>
                      <div style={{ fontSize:15, fontFamily:"'Instrument Serif',serif", fontStyle:"italic", color:warn?ACCENT.amber.base:good?GREEN:"rgba(232,230,223,.7)", transition:"all .15s" }}>{v ?? 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COL 3 — Question + transcript */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="mi-q-card">
            <div style={{ fontSize:9, fontWeight:700, color:typeInfo.accent.base, letterSpacing:".16em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}>
              Question {qIdx+1}
            </div>
            <p style={{ fontFamily:"'Instrument Serif',serif", fontSize:19, fontStyle:"italic", fontWeight:400, color:"#f0ede6", lineHeight:1.55 }}>
              "{questions[qIdx]}"
            </p>
            {phase === "question" && (
              <div style={{ marginTop:12, padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontSize:12, color:"rgba(232,230,223,.3)", lineHeight:1.65 }}>
                  Take a moment to think. Click <span style={{ color:GREEN, fontWeight:700 }}>Start Answering</span> when ready. You'll have 90 seconds.
                </p>
              </div>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:320, overflowY:"auto" }}>
            {transcript.map((m, i) => (
              <div key={i} className={`mi-bubble ${m.role}`}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:6, color:m.role==="user"?GREEN:"rgba(232,230,223,.3)" }}>
                  {m.role==="user"?"Your answer":"ML Feedback"}
                </div>
                {m.text}
              </div>
            ))}

            {isAnswering && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {/* Whisper live transcript */}
                <div className="mi-bubble user" style={{ borderColor:"rgba(203,126,154,.3)", background:"rgba(203,126,154,.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", color:ACCENT.rose.base, display:"flex", alignItems:"center", gap:5 }}>
                      <div className="mi-blink" style={{ width:4, height:4, borderRadius:"50%", background:ACCENT.rose.base }}/>
                      Whisper · {wordCount}w
                    </div>
                    <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:"rgba(232,230,223,.25)" }}>{timeLeft}s</span>
                  </div>
                  <span style={{ color:"rgba(232,230,223,.88)", lineHeight:1.7, fontSize:13 }}>
                    {liveCaption
                      ? <AnnotatedTranscript text={liveCaption} fillerPositions={rtSig.fillerPositions || []}/>
                      : <span style={{ color:"rgba(232,230,223,.3)", fontStyle:"italic" }}>
                          {whisperRef.current ? "Listening… transcribing every 4 seconds" : "Loading Whisper model…"}
                        </span>
                    }
                  </span>
                </div>

                {/* Typed fallback — always available during answering */}
                <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", color:"rgba(232,230,223,.3)", marginBottom:8 }}>
                    Type your answer (optional — supplements mic)
                  </div>
                  <textarea
                    value={typedAnswer}
                    onChange={e => {
                      const val = e.target.value;
                      setTypedAnswer(val);
                      // Score the typed text in real-time too
                      const combined = [finalTextRef.current, val].filter(Boolean).join(" ").trim();
                      if (combined && startTimeRef.current) {
                        captionRef.current = combined;
                        const elapsed = (Date.now() - startTimeRef.current) / 1000;
                        const sc = scoreRealTime(combined, questions[qIdx], elapsed, rmsRef.current);
                        setRtS({ clarity:sc.clarity, confidence:sc.confidence, relevance:sc.relevance, depth:sc.depth });
                        setRtSig(sc.signals || {});
                        setRtTip(getLiveTip(sc.signals || {}, sc));
                        setWordCount(combined.trim().split(/\s+/).filter(Boolean).length);
                      }
                    }}
                    placeholder="Start typing if mic isn't working…"
                    style={{
                      width:"100%", minHeight:72, padding:"10px 12px",
                      background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)",
                      borderRadius:10, color:"#e8e6df", fontSize:13, lineHeight:1.65,
                      fontFamily:"'Syne',sans-serif", fontWeight:500, resize:"vertical",
                      outline:"none", transition:"border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(126,203,161,.35)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
                  />
                </div>
              </div>
            )}

            {phase === "thinking" && (
              <div className="mi-bubble ai" style={{ background:"rgba(126,203,161,.04)", borderColor:"rgba(126,203,161,.15)" }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:8, color:GREEN, display:"flex", alignItems:"center", gap:5 }}>
                  <div className="mi-blink" style={{ width:4, height:4, borderRadius:"50%", background:GREEN }}/>
                  Deep ML evaluation
                </div>
                <div style={{ fontSize:11, color:GREEN, fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:6 }}>
                  <ThinkingDots/>
                  <span style={{ marginLeft:4 }}>{mlStatus || "Running…"}</span>
                </div>
              </div>
            )}

            {curFb && phase === "next" && (
              <div className="mi-bubble ai" style={{ background:"rgba(126,203,161,.03)", borderColor:"rgba(126,203,161,.12)" }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:6, color:GREEN }}>ML Feedback</div>
                <p style={{ fontSize:12, lineHeight:1.7 }}>{curFb[0]?.comment}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   RESULTS SCREEN
───────────────────────────────────────── */
function ResultsScreen({ data, config, onRetry, onDone }) {
  const { feedbacks, questions } = data;
  const typeInfo = INTERVIEW_TYPES.find(t => t.id === config.type) || INTERVIEW_TYPES[0];
  const cats = ["Clarity","Confidence","Relevance","Depth"];
  const icons = ["CL","CF","RE","DE"];
  const accents = [ACCENT.green, ACCENT.blue, ACCENT.amber, ACCENT.rose];
  const avgScores = cats.map((cat, fi) => {
    const scores = feedbacks.map(fb => fb[fi]?.score || 0);
    return { cat, icon:icons[fi], accent:accents[fi], avg:Math.round(scores.reduce((a,b)=>a+b,0)/(scores.length||1)) };
  });
  const overall = Math.round(avgScores.reduce((a,b)=>a+b.avg,0)/avgScores.length);
  const grade = overall>=85?"Excellent":overall>=70?"Good":overall>=55?"Fair":"Needs Work";
  const gradeColor = overall>=85?GREEN:overall>=70?ACCENT.blue.base:overall>=55?ACCENT.amber.base:ACCENT.rose.base;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div className="mi-fade-up">
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(232,230,223,.35)", letterSpacing:".12em", textTransform:"uppercase" }}>Interview Complete</span>
        </div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(30px,3.5vw,46px)", fontWeight:800, color:"#f0ede6", letterSpacing:"-.04em", margin:0 }}>
          Your <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:GREEN }}>report.</span>
        </h1>
      </div>

      <div className="mi-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="mi-fade-up mi-card" style={{ animationDelay:".06s" }}>
            <div className="mi-card-inner" style={{ textAlign:"center" }}>
              <SLabel>Overall Score</SLabel>
              <div style={{ position:"relative", width:120, height:120, margin:"0 auto 16px" }}>
                <RingScore score={overall} size={120} stroke={7} accent={gradeColor}/>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:42, color:gradeColor, lineHeight:1, filter:`drop-shadow(0 0 14px ${gradeColor}70)` }}>{overall}</div>
                  <div style={{ fontSize:9, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>/100</div>
                </div>
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:gradeColor, marginBottom:4 }}>{grade}</div>
              <div style={{ fontSize:12, color:"rgba(232,230,223,.35)" }}>{typeInfo.label} · {config.difficulty} · {questions.length} questions</div>
            </div>
          </div>

          <div className="mi-fade-up mi-card" style={{ animationDelay:".1s" }}>
            <div className="mi-card-inner">
              <SLabel>Category Breakdown</SLabel>
              {avgScores.map((s, i) => (
                <div key={i} className="mi-cat-row">
                  <div style={{ width:28, height:28, borderRadius:8, background:s.accent.dim, border:`1px solid ${s.accent.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, color:s.accent.base }}>{s.icon}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:"rgba(232,230,223,.6)", flex:1 }}>{s.cat}</span>
                  <div style={{ flex:1, height:4, borderRadius:999, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${s.avg}%`, background:`linear-gradient(90deg,${s.accent.base}60,${s.accent.base})`, borderRadius:999, transition:"width 1.4s cubic-bezier(.16,1,.3,1)" }}/>
                  </div>
                  <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:22, color:s.accent.base, minWidth:36, textAlign:"right" }}>{s.avg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mi-fade-up" style={{ animationDelay:".14s", display:"flex", flexDirection:"column", gap:8 }}>
            <button className="mi-btn-primary" onClick={onRetry}>Retry Interview →</button>
            <button className="mi-btn-ghost" onClick={onDone}>Back to Dashboard</button>
          </div>
        </div>

        <div className="mi-fade-up mi-card" style={{ animationDelay:".08s" }}>
          <div className="mi-card-inner">
            <SLabel>Question-by-Question</SLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:12, maxHeight:540, overflowY:"auto" }}>
              {questions.map((q, qi) => {
                const fb = feedbacks[qi]; if (!fb) return null;
                const qScore = Math.round(fb.reduce((a,f)=>a+f.score,0)/fb.length);
                const qColor = qScore>=75?GREEN:qScore>=58?ACCENT.amber.base:ACCENT.rose.base;
                return (
                  <div key={qi} className="mi-fb-item" style={{ animationDelay:`${qi*0.07}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:9, fontWeight:700, color:"rgba(232,230,223,.3)", fontFamily:"'JetBrains Mono',monospace" }}>Q{qi+1}</span>
                      <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:22, color:qColor, filter:`drop-shadow(0 0 6px ${qColor}60)` }}>{qScore}</span>
                    </div>
                    <p style={{ fontSize:12, color:"rgba(232,230,223,.55)", lineHeight:1.65, marginBottom:10 }}>"{q}"</p>
                    {fb[0]?.comment && <p style={{ fontSize:11, color:"rgba(232,230,223,.4)", lineHeight:1.65, marginBottom:10 }}>{fb[0].comment}</p>}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {fb.map((f, fi) => (
                        <div key={fi} className="mi-chip" style={{ background:f.accent.dim, border:`1px solid ${f.accent.border}`, color:f.accent.base }}>
                          {f.cat} · {f.score}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function AIMockInterview() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [screen,  setScreen]  = useState("setup");
  const [config,  setConfig]  = useState(null);
  const [results, setResults] = useState(null);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, accent = GREEN) => { setToast({ msg, accent }); setTimeout(() => setToast(null), 3000); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      {toast && (
        <div className="mi-toast">
          <div style={{ width:8, height:8, borderRadius:"50%", background:toast.accent, flexShrink:0 }}/>
          {toast.msg}
        </div>
      )}
      <div className="mi-root">
        <div className="mi-blob" style={{ width:560, height:560, background:"rgba(126,203,161,.05)", top:-160, right:-140 }}/>
        <div className="mi-blob" style={{ width:400, height:400, background:"rgba(80,100,200,.03)", bottom:160, left:-100, filter:"blur(110px)", animationDelay:"4s", animationDuration:"18s" }}/>
        <div className="mi-pad">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="mi-nav-btn" onClick={() => navigate("/student/dashboard")}>← Dashboard</button>
              {screen !== "setup" && <button className="mi-nav-btn" onClick={() => { setScreen("setup"); setConfig(null); setResults(null); }}>New Interview</button>}
            </div>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(126,203,161,.1)", border:"1px solid rgba(126,203,161,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <LogoMark/>
            </div>
          </div>

          {screen === "setup"     && <SetupScreen onStart={cfg => { setConfig(cfg); setScreen("interview"); showToast("Interview started — good luck!"); }}/>}
          {screen === "interview" && <InterviewScreen config={config} onComplete={d => { setResults(d); setScreen("results"); showToast("Done! ML report ready."); }}/>}
          {screen === "results"   && <ResultsScreen data={results} config={config} onRetry={() => { setScreen("setup"); setConfig(null); setResults(null); }} onDone={() => navigate("/student/dashboard")}/>}

          <div style={{ marginTop:32, padding:"16px 0", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontWeight:700 }}>PathwayAI · Mock Interview</span>
            <span style={{ fontSize:11, color:"rgba(232,230,223,.2)", fontFamily:"'JetBrains Mono',monospace" }}>In-browser ML · Zero server · Private</span>
          </div>
        </div>
      </div>
    </>
  );
}
