/**
 * darkTheme.js — PathwayAI shared design tokens
 * Assessment Generator aesthetic suite
 * #0c0c0f base · Syne · Instrument Serif · JetBrains Mono · #7ecba1 green
 */

export const DARK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Syne',sans-serif;background:#0c0c0f;color:#e8e6df;overflow-x:hidden}

/* ── Root ── */
.dk-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;position:relative;overflow-x:hidden}
.dk-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}
.dk-content{position:relative;z-index:1}

/* ── Animations ── */
@keyframes dk-fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes dk-spin{to{transform:rotate(360deg)}}
@keyframes dk-blob-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(24px,-16px) scale(1.04)}66%{transform:translate(-16px,24px) scale(.97)}}

.dk-fade-up{animation:dk-fade-up .55s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
.d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}

/* ── Cards ── */
.dk-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;position:relative;z-index:1;transition:border-color .2s}
.dk-card:hover{border-color:rgba(255,255,255,.13)}
.dk-card-raised{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;position:relative;z-index:1}

/* ── Stat block ── */
.dk-stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;position:relative;overflow:hidden;z-index:1;transition:border-color .2s,transform .2s}
.dk-stat:hover{border-color:rgba(126,203,161,.2);transform:translateY(-2px)}
.dk-stat-top{position:absolute;top:0;left:0;right:0;height:2px;background:var(--dk-stat-color,#7ecba1);opacity:.5;border-radius:2px 2px 0 0}

/* ── Badges / pills ── */
.dk-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.05em;background:rgba(126,203,161,.09);border:1px solid rgba(126,203,161,.2);color:#7ecba1}
.dk-pill-warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.25);color:#e0a020}
.dk-pill-err{background:rgba(220,80,80,.08);border-color:rgba(220,80,80,.2);color:#e06060}
.dk-pill-blue{background:rgba(80,130,220,.1);border-color:rgba(80,130,220,.25);color:#7aabee}
.dk-pill-purple{background:rgba(140,100,220,.1);border-color:rgba(140,100,220,.25);color:#b094e0}

/* ── Buttons ── */
.dk-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;border:none;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:all .2s}
.dk-btn-primary{background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);background-size:200%;color:#0c2018;text-transform:uppercase;letter-spacing:.06em}
.dk-btn-primary:hover{background-position:right;transform:translateY(-1px)}
.dk-btn-ghost{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(232,230,223,.55)}
.dk-btn-ghost:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#e8e6df}
.dk-btn-danger{background:rgba(220,80,80,.1);border:1px solid rgba(220,80,80,.25);color:#e06060}
.dk-btn-danger:hover{background:rgba(220,80,80,.18)}
.dk-btn-sm{padding:7px 14px;border-radius:9px;font-size:11px}

/* ── Inputs ── */
.dk-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:11px 14px;font-family:'Syne',sans-serif;font-size:13px;color:#e8e6df;outline:none;transition:border-color .2s}
.dk-input:focus{border-color:rgba(126,203,161,.48)}
.dk-input::placeholder{color:rgba(232,230,223,.22)}
.dk-textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:11px 14px;font-family:'Syne',sans-serif;font-size:13px;color:#e8e6df;outline:none;resize:vertical;min-height:80px;transition:border-color .2s;line-height:1.6}
.dk-textarea:focus{border-color:rgba(126,203,161,.48)}
.dk-textarea::placeholder{color:rgba(232,230,223,.22)}

/* ── Tabs ── */
.dk-tabs{display:flex;gap:4px;padding:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px}
.dk-tab{padding:7px 16px;border-radius:9px;font-size:11px;font-weight:700;letter-spacing:.04em;border:none;background:transparent;cursor:pointer;color:rgba(232,230,223,.38);transition:all .2s;font-family:'Syne',sans-serif}
.dk-tab.active{background:rgba(126,203,161,.12);color:#7ecba1;border:1px solid rgba(126,203,161,.25)}

/* ── Section title ── */
.dk-section-title{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(232,230,223,.28);margin-bottom:14px}
.dk-page-title{font-size:38px;font-weight:800;line-height:1.05;letter-spacing:-.03em;color:#f0ede6}
.dk-page-title-italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#7ecba1}
.dk-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,230,223,.3);margin-bottom:8px}

/* ── Progress bar ── */
.dk-prog-track{height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
.dk-prog-fill{height:100%;border-radius:2px;transition:width 1s cubic-bezier(.16,1,.3,1)}

/* ── Row ── */
.dk-row{display:flex;align-items:center;gap:14px;padding:13px 20px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .15s}
.dk-row:last-child{border-bottom:none}
.dk-row:hover{background:rgba(255,255,255,.02)}

/* ── Avatar ── */
.dk-avatar{border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'JetBrains Mono',monospace;color:white;flex-shrink:0}

/* ── Score badge ── */
.dk-score{display:inline-block;min-width:36px;text-align:center;padding:3px 8px;border-radius:7px;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace}

/* ── Alert ── */
.dk-alert{background:rgba(220,80,80,.06);border:1px solid rgba(220,80,80,.18);border-radius:14px;padding:16px 20px;z-index:1;position:relative}

/* ── Divider ── */
.dk-divider{border:none;border-top:1px solid rgba(255,255,255,.07)}

/* ── Mono ── */
.mono{font-family:'JetBrains Mono',monospace}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.18);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:rgba(126,203,161,.35)}
`;

export const AVATAR_COLORS = [
  "rgba(126,203,161,.18)",
  "rgba(120,160,220,.18)",
  "rgba(180,120,220,.18)",
  "rgba(220,160,80,.18)",
  "rgba(220,100,100,.18)",
  "rgba(80,180,200,.18)",
  "rgba(200,140,80,.18)",
  "rgba(140,200,120,.18)",
];

export const AVATAR_TEXT_COLORS = [
  "#7ecba1","#78a0dc","#b478dc","#dcaa50","#dc7070","#50b4c8","#c88c50","#8cc878"
];

export function scoreTheme(val) {
  if (val < 50) return { bg:"rgba(220,80,80,.1)",   text:"#e06060", border:"rgba(220,80,80,.22)"  };
  if (val < 65) return { bg:"rgba(245,158,11,.1)",  text:"#e0a020", border:"rgba(245,158,11,.25)" };
  if (val < 78) return { bg:"rgba(80,130,220,.1)",  text:"#7aabee", border:"rgba(80,130,220,.22)" };
  if (val < 88) return { bg:"rgba(126,203,161,.1)", text:"#7ecba1", border:"rgba(126,203,161,.22)"}; 
  return               { bg:"rgba(180,120,220,.1)", text:"#c094e8", border:"rgba(180,120,220,.22)"};
}
