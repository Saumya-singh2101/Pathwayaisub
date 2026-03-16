/**
 * LandingPage.jsx — PathwayAI
 * Redesigned to match Assessment Generator aesthetic suite:
 * #0c0c0f base · Syne 800 headings · Instrument Serif italics
 * #7ecba1 green accent · JetBrains Mono for data/badges
 * No Tailwind · No emojis · No light/dark toggle
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────── CSS ─────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Syne',sans-serif;background:#0c0c0f;color:#e8e6df;overflow-x:hidden}

@keyframes blob-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,28px) scale(.97)}}
@keyframes fade-up{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes slide-r{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
@keyframes slide-l{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
@keyframes scale-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-16px) rotate(1deg)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shimmer-bar{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes card-in{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes progress-fill{from{width:0%}to{width:100%}}
@keyframes ping-slow{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}

.lp-fade-up{animation:fade-up .75s cubic-bezier(.16,1,.3,1) both}
.lp-fade-in{animation:fade-in .8s ease both}
.lp-slide-r{animation:slide-r .7s cubic-bezier(.16,1,.3,1) both}
.lp-slide-l{animation:slide-l .7s cubic-bezier(.16,1,.3,1) both}
.lp-scale-in{animation:scale-in .6s cubic-bezier(.16,1,.3,1) both}
.lp-float{animation:float 6s ease-in-out infinite}
.lp-card-in{animation:card-in .7s cubic-bezier(.16,1,.3,1) both}
.lp-ping{animation:ping-slow 2.5s ease-out infinite}
.lp-blob{animation:blob-drift 14s ease-in-out infinite}

.d0{animation-delay:0s}.d1{animation-delay:.08s}.d2{animation-delay:.16s}
.d3{animation-delay:.24s}.d4{animation-delay:.32s}.d5{animation-delay:.4s}
.d6{animation-delay:.5s}.d7{animation-delay:.6s}.d8{animation-delay:.8s}
.d10{animation-delay:1s}.d12{animation-delay:1.2s}

/* ── Layout ── */
.lp-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.lp-blob-el{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}
.lp-section{position:relative;z-index:1}
.lp-container{max-width:1160px;margin:0 auto;padding:0 36px}

/* ── Navbar ── */
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;border-bottom:1px solid rgba(255,255,255,0);transition:border-color .3s,background .3s}
.lp-nav.scrolled{background:rgba(12,12,15,.88);backdrop-filter:blur(20px);border-bottom-color:rgba(255,255,255,.07)}
.lp-nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.lp-nav-logo-mark{width:34px;height:34px;border-radius:10px;background:rgba(126,203,161,.12);border:1px solid rgba(126,203,161,.28);display:flex;align-items:center;justify-content:center}
.lp-nav-name{font-size:17px;font-weight:800;letter-spacing:-.02em;color:#f0ede6}
.lp-nav-name span{font-family:'Instrument Serif',serif;font-style:italic;color:#7ecba1;font-weight:400}
.lp-nav-links{display:flex;align-items:center;gap:6px}
.lp-nav-link{padding:7px 14px;border-radius:9px;font-size:12px;font-weight:700;color:rgba(232,230,223,.45);background:none;border:none;cursor:pointer;transition:color .2s;font-family:'Syne',sans-serif;letter-spacing:.02em}
.lp-nav-link:hover{color:#e8e6df}
.lp-nav-cta{padding:9px 18px;border-radius:10px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border:none;background:rgba(126,203,161,.13);color:#7ecba1;cursor:pointer;font-family:'Syne',sans-serif;transition:all .2s}
.lp-nav-cta:hover{background:rgba(126,203,161,.22)}

/* ── Hero ── */
.lp-hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;z-index:1}
.lp-hero-inner{max-width:1160px;margin:0 auto;padding:0 36px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lp-hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,230,223,.3);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.lp-hero-ping{position:relative;width:7px;height:7px}
.lp-hero-ping-dot{width:7px;height:7px;border-radius:50%;background:#7ecba1;position:absolute}
.lp-hero-ping-ring{width:7px;height:7px;border-radius:50%;background:#7ecba1;position:absolute}
.lp-h1{font-size:62px;font-weight:800;line-height:1.0;letter-spacing:-.04em;color:#f0ede6;margin-bottom:8px}
.lp-h1-italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#7ecba1;display:block}
.lp-hero-sub{font-size:15px;color:rgba(232,230,223,.45);line-height:1.75;margin-bottom:36px;max-width:480px}
.lp-hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.lp-btn-primary{padding:14px 28px;border-radius:14px;border:none;background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);background-size:200%;color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s}
.lp-btn-primary:hover{background-position:right;transform:translateY(-2px)}
.lp-btn-ghost{padding:14px 28px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:rgba(232,230,223,.65);font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:all .2s}
.lp-btn-ghost:hover{border-color:rgba(255,255,255,.25);color:#e8e6df}
.lp-hero-stats{display:flex;gap:28px;margin-top:40px;padding-top:36px;border-top:1px solid rgba(255,255,255,.07)}
.lp-stat-num{font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:500;color:#7ecba1}
.lp-stat-lbl{font-size:11px;color:rgba(232,230,223,.3);margin-top:3px;letter-spacing:.04em}

/* Hero visual card */
.lp-hero-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:28px;position:relative;overflow:hidden}
.lp-hero-card::before{content:'';position:absolute;inset:0;border-radius:22px;background:linear-gradient(135deg,rgba(126,203,161,.04),transparent 60%);pointer-events:none}
.lp-card-eyebrow{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(126,203,161,.6);margin-bottom:14px;font-family:'JetBrains Mono',monospace}
.lp-q-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px;margin-bottom:8px}
.lp-q-text{font-size:12px;font-weight:600;color:#e8e6df;margin-bottom:10px;line-height:1.5}
.lp-q-opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.lp-q-opt{padding:7px 10px;border-radius:8px;font-size:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:rgba(232,230,223,.45)}
.lp-q-opt.correct{background:rgba(126,203,161,.08);border-color:rgba(126,203,161,.25);color:#7ecba1;font-weight:700}
.lp-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:rgba(126,203,161,.09);border:1px solid rgba(126,203,161,.2);color:#7ecba1;font-family:'JetBrains Mono',monospace}
.lp-progress-bar{height:3px;background:rgba(255,255,255,.07);border-radius:2px;margin-top:14px;overflow:hidden}
.lp-progress-fill{height:100%;background:linear-gradient(90deg,#7ecba1,#a8e6c4);border-radius:2px;animation:progress-fill 2.4s cubic-bezier(.4,0,.2,1) 1s both}

/* ── Marquee strip ── */
.lp-marquee-section{padding:28px 0;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);overflow:hidden;position:relative;z-index:1;background:rgba(255,255,255,.015)}
.lp-marquee-track{display:flex;width:max-content;animation:marquee 32s linear infinite}
.lp-marquee-item{display:flex;align-items:center;gap:10px;padding:0 32px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(232,230,223,.28);white-space:nowrap}
.lp-marquee-dot{width:4px;height:4px;border-radius:50%;background:rgba(126,203,161,.4);flex-shrink:0}

/* ── Section title pattern ── */
.lp-sec-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(126,203,161,.7);margin-bottom:12px}
.lp-sec-title{font-size:42px;font-weight:800;line-height:1.05;letter-spacing:-.03em;color:#f0ede6;margin-bottom:10px}
.lp-sec-title-italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#7ecba1}
.lp-sec-sub{font-size:14px;color:rgba(232,230,223,.4);line-height:1.75;max-width:520px}

/* ── About / Features ── */
.lp-about{padding:120px 0;position:relative;z-index:1}
.lp-about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.lp-about-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lp-about-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px;transition:border-color .2s,transform .2s}
.lp-about-card:hover{border-color:rgba(126,203,161,.2);transform:translateY(-3px)}
.lp-about-card-icon{width:36px;height:36px;border-radius:10px;background:rgba(126,203,161,.08);border:1px solid rgba(126,203,161,.18);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.lp-about-card-title{font-size:13px;font-weight:700;color:#e8e6df;margin-bottom:4px}
.lp-about-card-sub{font-size:12px;color:rgba(232,230,223,.35);line-height:1.6}

/* ── Feature showcase ── */
.lp-features{padding:100px 0;position:relative;z-index:1}
.lp-features-inner{display:grid;grid-template-columns:280px 1fr;gap:40px;align-items:start}
.lp-feat-tabs{display:flex;flex-direction:column;gap:6px;position:sticky;top:100px}
.lp-feat-tab{padding:14px 16px;border-radius:14px;border:1px solid transparent;background:transparent;cursor:pointer;text-align:left;transition:all .2s;font-family:'Syne',sans-serif}
.lp-feat-tab.active{background:rgba(126,203,161,.07);border-color:rgba(126,203,161,.22)}
.lp-feat-tab-title{font-size:13px;font-weight:700;color:rgba(232,230,223,.4);transition:color .2s}
.lp-feat-tab.active .lp-feat-tab-title{color:#7ecba1}
.lp-feat-tab-sub{font-size:11px;color:rgba(232,230,223,.22);margin-top:3px}
.lp-feat-tab.active .lp-feat-tab-sub{color:rgba(126,203,161,.55)}
.lp-feat-tab-bar{width:0;height:2px;background:#7ecba1;border-radius:1px;margin-top:8px;transition:width .35s cubic-bezier(.4,0,.2,1)}
.lp-feat-tab.active .lp-feat-tab-bar{width:100%}
.lp-feat-panel{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:36px;min-height:400px;animation:slide-l .4s cubic-bezier(.16,1,.3,1) both}
.lp-feat-panel-eyebrow{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(126,203,161,.6);margin-bottom:12px;font-family:'JetBrains Mono',monospace}
.lp-feat-panel-title{font-size:26px;font-weight:800;letter-spacing:-.02em;color:#f0ede6;margin-bottom:8px}
.lp-feat-panel-desc{font-size:13px;color:rgba(232,230,223,.45);line-height:1.75;margin-bottom:24px}
.lp-feat-list{display:flex;flex-direction:column;gap:10px}
.lp-feat-list-item{display:flex;align-items:center;gap:10px;font-size:13px;color:rgba(232,230,223,.55)}
.lp-feat-check{width:18px;height:18px;border-radius:5px;background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lp-feat-panel-demo{margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.lp-feat-demo-block{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px}
.lp-feat-demo-num{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:500;color:#7ecba1}
.lp-feat-demo-lbl{font-size:10px;color:rgba(232,230,223,.3);margin-top:2px;letter-spacing:.04em}

/* ── Testimonials ── */
.lp-testimonials{padding:100px 0;position:relative;z-index:1}
.lp-testi-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:48px;text-align:center;animation:card-in .6s cubic-bezier(.16,1,.3,1) both}
.lp-testi-quote{font-family:'Instrument Serif',serif;font-size:24px;font-style:italic;color:#e8e6df;line-height:1.6;margin-bottom:32px;max-width:640px;margin-left:auto;margin-right:auto}
.lp-testi-avatar{width:48px;height:48px;border-radius:14px;background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.22);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;color:#7ecba1;margin:0 auto 10px}
.lp-testi-name{font-size:14px;font-weight:700;color:#e8e6df}
.lp-testi-role{font-size:11px;color:rgba(232,230,223,.3);margin-top:2px;font-family:'JetBrains Mono',monospace}
.lp-testi-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:24px}
.lp-testi-btn{width:36px;height:36px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,230,223,.4);cursor:pointer;font-size:13px;font-weight:700;transition:all .2s;display:flex;align-items:center;justify-content:center}
.lp-testi-btn:hover{border-color:rgba(126,203,161,.3);color:#7ecba1}
.lp-testi-dots{display:flex;gap:6px}
.lp-testi-dot{height:6px;border-radius:3px;border:none;cursor:pointer;transition:all .3s;background:rgba(255,255,255,.1)}
.lp-testi-dot.active{background:#7ecba1;width:24px}
.lp-testi-dot:not(.active){width:6px}

/* ── CTA Banner ── */
.lp-cta{padding:120px 0;position:relative;z-index:1;text-align:center}
.lp-cta-inner{max-width:700px;margin:0 auto}
.lp-cta-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:rgba(126,203,161,.08);border:1px solid rgba(126,203,161,.2);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(126,203,161,.8);margin-bottom:28px;font-family:'JetBrains Mono',monospace}
.lp-cta-title{font-size:52px;font-weight:800;line-height:1.0;letter-spacing:-.04em;color:#f0ede6;margin-bottom:16px}
.lp-cta-sub{font-size:15px;color:rgba(232,230,223,.4);line-height:1.75;margin-bottom:36px}
.lp-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ── Footer ── */
.lp-footer{padding:72px 0 36px;border-top:1px solid rgba(255,255,255,.07);position:relative;z-index:1}
.lp-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:48px;margin-bottom:52px}
.lp-footer-brand{max-width:220px}
.lp-footer-brand-name{font-size:17px;font-weight:800;letter-spacing:-.02em;color:#f0ede6;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.lp-footer-brand-name span{font-family:'Instrument Serif',serif;font-style:italic;color:#7ecba1;font-weight:400}
.lp-footer-brand-desc{font-size:12px;color:rgba(232,230,223,.3);line-height:1.75;margin-bottom:16px}
.lp-sdg-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.lp-sdg{padding:3px 9px;border-radius:5px;font-size:10px;font-weight:800;font-family:'JetBrains Mono',monospace;background:rgba(126,203,161,.09);border:1px solid rgba(126,203,161,.2);color:rgba(126,203,161,.7)}
.lp-social-row{display:flex;gap:8px}
.lp-social-btn{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:rgba(232,230,223,.3)}
.lp-social-btn:hover{background:rgba(126,203,161,.1);border-color:rgba(126,203,161,.25);color:#7ecba1}
.lp-footer-col-title{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,230,223,.25);margin-bottom:18px}
.lp-footer-links{display:flex;flex-direction:column;gap:10px}
.lp-footer-link{font-size:12px;color:rgba(232,230,223,.35);background:none;border:none;cursor:pointer;text-align:left;font-family:'Syne',sans-serif;transition:color .2s;padding:0}
.lp-footer-link:hover{color:#7ecba1}
.lp-footer-contact-item{margin-bottom:14px}
.lp-footer-contact-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(232,230,223,.2);margin-bottom:3px;font-family:'JetBrains Mono',monospace}
.lp-footer-contact-val{font-size:12px;color:rgba(232,230,223,.4)}
.lp-footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:24px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:rgba(232,230,223,.2);font-family:'JetBrains Mono',monospace;flex-wrap:wrap;gap:10px}

@media(max-width:900px){
  .lp-hero-inner,.lp-about-grid{grid-template-columns:1fr;gap:48px}
  .lp-features-inner{grid-template-columns:1fr}
  .lp-feat-tabs{flex-direction:row;overflow-x:auto;position:static}
  .lp-footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .lp-h1{font-size:40px}
  .lp-sec-title{font-size:30px}
  .lp-cta-title{font-size:34px}
  .lp-container{padding:0 20px}
  .lp-nav{padding:0 20px}
  .lp-hero-inner{padding:0 20px}
  .lp-nav-links .lp-nav-link{display:none}
}
`;

/* ── Data ── */
const FEATURES = [
  {
    id: "assess",
    title: "Assessment Generator",
    sub: "AI-crafted questions",
    desc: "Generate MCQ, True/False, and Short Answer questions on any topic in seconds — powered by a local Llama model.",
    points: ["Any subject, any difficulty", "Instant answer reveal", "Export to share with class", "Offline — no internet needed"],
    stats: [{ num: "20+", lbl: "Question types" }, { num: "7", lbl: "Subjects" }],
  },
  {
    id: "resume",
    title: "Resume Builder",
    sub: "AI summary writing",
    desc: "Build a professional resume with Llama writing your summary — tailored to your actual skills and experience.",
    points: ["Live preview while you type", "AI-generated professional summary", "Print to PDF in one click", "Skills, education, projects"],
    stats: [{ num: "5+", lbl: "Sections" }, { num: "1-click", lbl: "PDF export" }],
  },
  {
    id: "tutor",
    title: "AI Tutor",
    sub: "Personalised guidance",
    desc: "Ask anything about your syllabus and get clear, structured explanations — no internet, no subscription.",
    points: ["9 Indian languages supported", "Explains step-by-step", "Works on 2G and offline", "Zero data collection"],
    stats: [{ num: "9", lbl: "Languages" }, { num: "2G", lbl: "Compatible" }],
  },
  {
    id: "mentor",
    title: "Peer Mentors",
    sub: "Earn while teaching",
    desc: "Top students become mentors, guide their peers, and earn verifiable credentials and UPI payouts.",
    points: ["Verifiable teaching credentials", "UPI-based payouts", "Track mentee progress", "Build a reputation"],
    stats: [{ num: "UPI", lbl: "Payouts" }, { num: "100%", lbl: "Free to start" }],
  },
];

const TESTIMONIALS = [
  { quote: "I gave my first assessment in Hindi. Students actually understood the questions. That never happened before.", name: "Priya T.", role: "Teacher · Pune", initials: "PT" },
  { quote: "The AI summary wrote my resume better than I could have. I got an interview within two weeks.", name: "Rahul K.", role: "Student · Mumbai", initials: "RK" },
  { quote: "I taught 12 students last month and earned enough to buy my own textbooks. This changed everything.", name: "Sneha D.", role: "Peer Mentor · Nagpur", initials: "SD" },
  { quote: "No internet, no problem. PathwayAI works on my phone's hotspot without burning data.", name: "Arjun M.", role: "Student · Rural Maharashtra", initials: "AM" },
];

const ABOUT_CARDS = [
  { icon: "◆", title: "Offline First", sub: "Works on 2G, no internet required" },
  { icon: "▲", title: "Local AI", sub: "Llama runs entirely on-device" },
  { icon: "●", title: "9 Languages", sub: "Hindi, Marathi, Tamil and more" },
  { icon: "■", title: "Always Free", sub: "No ads, no paywall for students" },
];

/* ── SVG Icons ── */
const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" fill="rgba(126,203,161,0.15)"/>
    <path d="M5 5.5h6a4 4 0 0 1 0 8H5V5.5z" fill="#7ecba1" fillOpacity=".9"/>
    <circle cx="16.5" cy="15.5" r="2.5" fill="#7ecba1" fillOpacity=".7"/>
    <line x1="16.5" y1="5.5" x2="16.5" y2="11.5" stroke="#7ecba1" strokeWidth="2" strokeLinecap="round" strokeOpacity=".7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#7ecba1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Intersection observer hook ── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, vis] = useFadeIn();
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? undefined : 0, animation: vis ? `fade-up .7s cubic-bezier(.16,1,.3,1) ${delay}s both` : "none" }}>
      {children}
    </div>
  );
}

/* ─────────────── Navbar ─────────────── */
function Navbar({ navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
      <button className="lp-nav-logo" onClick={() => navigate("/")}>
        <div className="lp-nav-logo-mark"><LogoMark /></div>
        <div className="lp-nav-name">Pathway<span>AI</span></div>
      </button>
      <div className="lp-nav-links">
        {[["Features","#features"],["About","#about"],["Stories","#stories"]].map(([l,h]) => (
          <a key={l} href={h} className="lp-nav-link" style={{ textDecoration:"none" }}>{l}</a>
        ))}
        <button className="lp-nav-cta" onClick={() => navigate("/role")}>Get Started</button>
      </div>
    </nav>
  );
}

/* ─────────────── Hero ─────────────── */
function Hero({ navigate }) {
  return (
    <section className="lp-hero lp-section">
      <div className="lp-hero-inner">
        <div>
          <div className="lp-hero-eyebrow lp-fade-up">
            <div className="lp-hero-ping">
              <div className="lp-hero-ping-dot" />
              <div className="lp-hero-ping-ring lp-ping" style={{ opacity: .6 }} />
            </div>
            AI-Powered Learning — Offline
          </div>
          <h1 className="lp-h1 lp-fade-up d1">
            Learn in your<br />
            <span className="lp-h1-italic">own language.</span>
          </h1>
          <p className="lp-hero-sub lp-fade-up d2">
            PathwayAI brings AI-powered assessments, resume building, and peer mentorship to every student — no internet, no English, no cost.
          </p>
          <div className="lp-hero-btns lp-fade-up d3">
            <button className="lp-btn-primary" onClick={() => navigate("/role")}>
              Get Started Free
            </button>
            <a href="#features" className="lp-btn-ghost" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
              See Features <ArrowRight />
            </a>
          </div>
          <div className="lp-hero-stats lp-fade-up d4">
            {[["10K+","Active learners"],["9","Indian languages"],["100%","Free for students"]].map(([n,l]) => (
              <div key={l}>
                <div className="lp-stat-num">{n}</div>
                <div className="lp-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-hero-card lp-float lp-fade-in d3">
          <div className="lp-card-eyebrow">Assessment Preview</div>
          <div className="lp-q-item">
            <div className="lp-q-text">What is the discriminant of ax² + bx + c = 0?</div>
            <div className="lp-q-opts">
              {["b² − 4ac","4ac − b²","b² + 4ac","−b² + 4ac"].map((o,i) => (
                <div key={i} className={`lp-q-opt${i===0?" correct":""}`}>{String.fromCharCode(65+i)}. {o}</div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14 }}>
            <span className="lp-badge">Mathematics · Medium</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(232,230,223,.28)" }}>Q 1/5</span>
          </div>
          <div className="lp-progress-bar"><div className="lp-progress-fill" style={{ width:"20%" }} /></div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Marquee ─────────────── */
function MarqueeStrip() {
  const items = ["Mathematics","Science","History","English","Geography","Physics","Chemistry","MCQ","True/False","Short Answer","9 Languages","Offline Ready","Free Forever","Llama Powered","Verifiable Credentials"];
  const doubled = [...items, ...items];
  return (
    <div className="lp-marquee-section lp-section">
      <div className="lp-marquee-track">
        {doubled.map((t, i) => (
          <div key={i} className="lp-marquee-item">
            <div className="lp-marquee-dot" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── About ─────────────── */
function About() {
  return (
    <section id="about" className="lp-about lp-section">
      <div className="lp-container">
        <div className="lp-about-grid">
          <div>
            <FadeUp>
              <div className="lp-sec-eyebrow">Why PathwayAI</div>
              <h2 className="lp-sec-title">Built for<br /><span className="lp-sec-title-italic">Bharat.</span></h2>
              <p className="lp-sec-sub" style={{ marginBottom:32 }}>
                250 million students in India lack access to quality education. We built PathwayAI to run without internet, work in 9 languages, and cost nothing — powered entirely by a local AI.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  ["SDG 4", "Quality Education — accessible to all"],
                  ["SDG 8", "Decent Work — through peer mentorship"],
                  ["SDG 10", "Reduced Inequalities — no language barrier"],
                ].map(([badge, text]) => (
                  <div key={badge} style={{ display:"flex", alignItems:"center", gap:12, fontSize:13, color:"rgba(232,230,223,.5)" }}>
                    <span className="lp-sdg">{badge}</span>
                    {text}
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
          <FadeUp delay={0.15}>
            <div className="lp-about-cards">
              {ABOUT_CARDS.map(c => (
                <div key={c.title} className="lp-about-card">
                  <div className="lp-about-card-icon">
                    <span style={{ fontSize:14, color:"#7ecba1" }}>{c.icon}</span>
                  </div>
                  <div className="lp-about-card-title">{c.title}</div>
                  <div className="lp-about-card-sub">{c.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Feature Showcase ─────────────── */
function FeatureShowcase({ navigate }) {
  const [active, setActive] = useState(0);
  const feat = FEATURES[active];
  return (
    <section id="features" className="lp-features lp-section">
      <div className="lp-container">
        <FadeUp>
          <div style={{ marginBottom:48 }}>
            <div className="lp-sec-eyebrow">What you get</div>
            <h2 className="lp-sec-title">Every tool you <span className="lp-sec-title-italic">need.</span></h2>
          </div>
        </FadeUp>
        <div className="lp-features-inner">
          <div className="lp-feat-tabs">
            {FEATURES.map((f, i) => (
              <button key={f.id} className={`lp-feat-tab${active===i?" active":""}`} onClick={() => setActive(i)}>
                <div className="lp-feat-tab-title">{f.title}</div>
                <div className="lp-feat-tab-sub">{f.sub}</div>
                <div className="lp-feat-tab-bar" />
              </button>
            ))}
          </div>
          <div key={active} className="lp-feat-panel">
            <div className="lp-feat-panel-eyebrow">{feat.sub}</div>
            <div className="lp-feat-panel-title">{feat.title}</div>
            <div className="lp-feat-panel-desc">{feat.desc}</div>
            <div className="lp-feat-list">
              {feat.points.map(p => (
                <div key={p} className="lp-feat-list-item">
                  <div className="lp-feat-check"><CheckIcon /></div>
                  {p}
                </div>
              ))}
            </div>
            <div className="lp-feat-panel-demo">
              {feat.stats.map(s => (
                <div key={s.lbl} className="lp-feat-demo-block">
                  <div className="lp-feat-demo-num">{s.num}</div>
                  <div className="lp-feat-demo-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
            <button className="lp-btn-primary" style={{ marginTop:24 }} onClick={() => navigate("/role")}>
              Try {feat.title}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Testimonials ─────────────── */
function Testimonials() {
  const [active, setActive] = useState(0);
  const [key, setKey] = useState(0);
  const go = useCallback((i) => { setActive(i); setKey(k => k + 1); }, []);
  useEffect(() => {
    const t = setInterval(() => go((active + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [active, go]);
  const t = TESTIMONIALS[active];
  return (
    <section id="stories" className="lp-testimonials lp-section">
      <div className="lp-container">
        <FadeUp>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div className="lp-sec-eyebrow" style={{ justifyContent:"center", display:"flex" }}>Real Stories</div>
            <h2 className="lp-sec-title" style={{ textAlign:"center" }}>Heard from the <span className="lp-sec-title-italic">ground.</span></h2>
          </div>
        </FadeUp>
        <div key={key} className="lp-testi-card">
          <div style={{ fontSize:60, fontFamily:"'Instrument Serif',serif", color:"rgba(126,203,161,.15)", lineHeight:1, marginBottom:8 }}>"</div>
          <div className="lp-testi-quote">{t.quote}</div>
          <div className="lp-testi-avatar">{t.initials}</div>
          <div className="lp-testi-name">{t.name}</div>
          <div className="lp-testi-role">{t.role}</div>
        </div>
        <div className="lp-testi-nav">
          <button className="lp-testi-btn" onClick={() => go((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>←</button>
          <div className="lp-testi-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`lp-testi-dot${active===i?" active":""}`} onClick={() => go(i)} />
            ))}
          </div>
          <button className="lp-testi-btn" onClick={() => go((active + 1) % TESTIMONIALS.length)}>→</button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── CTA Banner ─────────────── */
function CTABanner({ navigate }) {
  return (
    <section className="lp-cta lp-section">
      <div className="lp-container">
        <FadeUp>
          <div className="lp-cta-inner">
            <div className="lp-cta-pill">
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#7ecba1" }} />
              Join 10,000+ learners
            </div>
            <h2 className="lp-cta-title">
              Your journey starts<br />
              <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:"#7ecba1" }}>right here.</span>
            </h2>
            <p className="lp-cta-sub">No internet required. No English required. No money required. Just sign up and start learning in your language today.</p>
            <div className="lp-cta-btns">
              <button className="lp-btn-primary" onClick={() => navigate("/role")}>Get Started Free</button>
              <a href="#about" className="lp-btn-ghost" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>Learn More</a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */
function Footer() {
  const cols = [
    { title: "Platform",     links: ["For Students","For Teachers","For Mentors","Offline Mode","AI Tutor","Study Plans"] },
    { title: "Organisation", links: ["About Us","Our Mission","Enactus","SDG Alignment","Press Kit","Careers"] },
  ];
  return (
    <footer id="contact" className="lp-footer lp-section">
      <div className="lp-container">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <div className="lp-footer-brand-name">
              <div style={{ width:28, height:28, borderRadius:8, background:"rgba(126,203,161,.12)", border:"1px solid rgba(126,203,161,.25)", display:"flex", alignItems:"center", justifyContent:"center" }}><LogoMark /></div>
              Pathway<span>AI</span>
            </div>
            <div className="lp-footer-brand-desc">Learn in your language. Earn while you teach. Belong to a system that works for you.</div>
            <div className="lp-sdg-row">{["SDG 4","SDG 5","SDG 8","SDG 10"].map(s => <span key={s} className="lp-sdg">{s}</span>)}</div>
            <div className="lp-social-row">
              {["T","in","ig"].map((s,i) => (
                <button key={i} className="lp-social-btn" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:500 }}>{s}</button>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div className="lp-footer-col-title">{c.title}</div>
              <div className="lp-footer-links">
                {c.links.map(l => <button key={l} className="lp-footer-link">{l}</button>)}
              </div>
            </div>
          ))}
          <div>
            <div className="lp-footer-col-title">Contact</div>
            {[{ l:"Email", v:"pathwayai@enactus.org" },{ l:"Location", v:"India · Serving Bharat" },{ l:"Website", v:"pathwayai.in" },{ l:"WhatsApp", v:"+91 98765 43210" }].map(c => (
              <div key={c.l} className="lp-footer-contact-item">
                <div className="lp-footer-contact-lbl">{c.l}</div>
                <div className="lp-footer-contact-val">{c.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 PathwayAI · Enactus EnCode · Education Domain</span>
          <span>Works on 2G · Offline · 9 Indian languages · Free for students</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────── Root ─────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">
        {/* Ambient blobs */}
        <div className="lp-blob-el lp-blob" style={{ width:580, height:580, background:"rgba(126,203,161,0.05)", top:-160, right:-140 }} />
        <div className="lp-blob-el" style={{ width:440, height:440, background:"rgba(80,100,200,0.03)", bottom:200, left:-100, filter:"blur(110px)", animation:"blob-drift 18s ease-in-out 4s infinite" }} />
        <div className="lp-blob-el" style={{ width:300, height:300, background:"rgba(126,203,161,0.025)", top:"45%", left:"30%", filter:"blur(100px)", animation:"blob-drift 22s ease-in-out 8s infinite" }} />
        <Navbar navigate={navigate} />
        <Hero navigate={navigate} />
        <MarqueeStrip />
        <About />
        <FeatureShowcase navigate={navigate} />
        <Testimonials />
        <CTABanner navigate={navigate} />
        <Footer />
      </div>
    </>
  );
}
