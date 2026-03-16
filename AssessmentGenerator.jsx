import { useState } from "react";

// ── Ollama config ─────────────────────────────────────────────
const OLLAMA_URL   = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3"; // change to llama3.2, llama3.1, mistral, etc.
// ─────────────────────────────────────────────────────────────

const SUBJECTS = ["Mathematics","Science","History","English","Geography","Physics","Chemistry"];
const TOPICS = {
  Mathematics: ["Quadratic Equations","Trigonometry","Statistics","Coordinate Geometry","Calculus","Number Theory","Probability"],
  Science:     ["Newton's Laws","Photosynthesis","Chemical Reactions","Electricity","Evolution","Cell Biology","Genetics"],
  History:     ["French Revolution","World War II","Indian Independence","Cold War","Ancient Rome","Renaissance","Industrial Revolution"],
  English:     ["Grammar & Tenses","Poetry Analysis","Essay Writing","Reading Comprehension","Shakespeare","Rhetoric","Narrative Techniques"],
  Geography:   ["Climate Zones","Maps & Cartography","Natural Resources","Population","Rivers","Tectonics","Urbanization"],
  Physics:     ["Optics","Waves","Thermodynamics","Magnetism","Modern Physics","Relativity","Quantum Mechanics"],
  Chemistry:   ["Periodic Table","Chemical Bonding","Acids & Bases","Organic Chemistry","Equilibrium","Electrochemistry","Polymers"],
};
const TYPES = ["MCQ","True/False","Short Answer","Mixed"];
const DIFFS = ["Easy","Medium","Hard","Mixed"];

async function ollamaGenerate(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.response || "";
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
.ag-root{min-height:100vh;background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif;overflow-x:hidden;position:relative}
.ag-blob{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
.ag-layout{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 32px 80px}
.ag-header{padding:52px 0 44px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:44px}
.ag-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#7ecba1;margin-bottom:10px}
.ag-title{font-size:46px;font-weight:800;line-height:1.0;letter-spacing:-.03em;color:#f0ede6}
.ag-title span{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:#7ecba1}
.ag-header-meta{font-size:12px;color:rgba(232,230,223,.28);text-align:right;line-height:1.8}
.ag-model-badge{display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.25);color:#7ecba1;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;margin-top:6px}

.ag-grid{display:grid;grid-template-columns:330px 1fr;gap:24px;align-items:start}
.ag-panel{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:26px;position:sticky;top:24px}
.ag-panel-title{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(232,230,223,.28);margin-bottom:22px}
.ag-field{margin-bottom:18px}
.ag-label{display:block;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(232,230,223,.38);margin-bottom:7px}
.ag-sel-wrap{position:relative}
.ag-sel-wrap::after{content:'';position:absolute;right:13px;top:50%;transform:translateY(-50%);width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid rgba(232,230,223,.32);pointer-events:none}
.ag-select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;font-family:'Syne',sans-serif;font-size:13px;color:#e8e6df;outline:none;cursor:pointer;appearance:none;transition:border-color .2s}
.ag-select:focus{border-color:rgba(126,203,161,.5)}
.ag-select option{background:#1a1a1f}
.ag-diff-row{display:flex;gap:6px;flex-wrap:wrap}
.ag-diff-btn{padding:7px 13px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:.05em;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,230,223,.38);cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif}
.ag-diff-btn:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.ag-diff-btn.on{background:rgba(126,203,161,.12);border-color:rgba(126,203,161,.4);color:#7ecba1}
.ag-count-row{display:flex;align-items:center;gap:11px}
.ag-num{width:62px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:9px 12px;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;color:#e8e6df;outline:none;text-align:center;transition:border-color .2s}
.ag-num:focus{border-color:rgba(126,203,161,.5)}
.ag-prog{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
.ag-prog-fill{height:100%;background:linear-gradient(90deg,#7ecba1,#a8e6c4);border-radius:2px;transition:width .3s}
.ag-gen-btn{width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#7ecba1,#a8e6c4,#7ecba1);background-size:200%;color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .3s;margin-top:8px}
.ag-gen-btn:hover{background-position:right;transform:translateY(-1px)}
.ag-gen-btn:disabled{background:rgba(126,203,161,.2);color:rgba(12,32,24,.4);cursor:not-allowed;transform:none}
.ag-summary{margin-top:18px;padding:14px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px}
.ag-sum-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px}
.ag-sum-row:last-child{border-bottom:none}
.ag-sum-lbl{color:rgba(232,230,223,.28)}
.ag-sum-val{color:#7ecba1;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px}

.ag-empty{background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.09);border-radius:20px;padding:80px 40px;text-align:center}
.ag-empty-icon{width:60px;height:60px;border-radius:18px;background:rgba(126,203,161,.07);border:1px solid rgba(126,203,161,.18);margin:0 auto 18px;display:flex;align-items:center;justify-content:center}
.ag-empty-dot{width:18px;height:18px;border-radius:50%;background:rgba(126,203,161,.25)}
.ag-empty-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:22px;color:rgba(232,230,223,.4);margin-bottom:8px}
.ag-empty-sub{font-size:13px;color:rgba(232,230,223,.2)}

.ag-loading{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:80px 40px;text-align:center}
.ag-spin{width:38px;height:38px;border-radius:50%;border:2px solid rgba(126,203,161,.14);border-top-color:#7ecba1;margin:0 auto 18px;animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ag-load-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:20px;color:rgba(232,230,223,.5);margin-bottom:8px}
.ag-load-sub{font-size:12px;color:rgba(232,230,223,.26);font-family:'JetBrains Mono',monospace}

.ag-res-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px}
.ag-res-count{font-family:'Instrument Serif',serif;font-style:italic;font-size:21px;color:rgba(232,230,223,.8)}
.ag-res-meta{font-size:11px;color:rgba(232,230,223,.26);margin-left:8px;font-family:'JetBrains Mono',monospace}
.ag-actions{display:flex;gap:8px}
.ag-btn-ghost{padding:7px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:transparent;color:rgba(232,230,223,.45);font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .2s}
.ag-btn-ghost:hover{border-color:rgba(255,255,255,.25);color:#e8e6df}
.ag-btn-green{padding:7px 14px;border-radius:9px;border:none;background:rgba(126,203,161,.13);color:#7ecba1;font-family:'Syne',sans-serif;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .2s}
.ag-btn-green:hover{background:rgba(126,203,161,.22)}

.ag-qcard{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px;margin-bottom:10px;transition:border-color .2s,transform .2s;animation:fadeUp .4s ease both}
.ag-qcard:hover{border-color:rgba(255,255,255,.13);transform:translateY(-2px)}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ag-qhead{display:flex;align-items:flex-start;gap:13px;margin-bottom:14px}
.ag-qnum{width:30px;height:30px;border-radius:9px;flex-shrink:0;background:rgba(126,203,161,.09);border:1px solid rgba(126,203,161,.22);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#7ecba1;font-family:'JetBrains Mono',monospace}
.ag-qtext{flex:1;font-size:14px;font-weight:600;color:#e8e6df;line-height:1.7}
.ag-qbadge{padding:3px 8px;border-radius:5px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:rgba(126,203,161,.09);color:rgba(126,203,161,.65);border:1px solid rgba(126,203,161,.18);white-space:nowrap;margin-top:5px;display:inline-block}
.ag-reveal{padding:5px 11px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,230,223,.36);font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .2s;flex-shrink:0}
.ag-reveal:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.ag-opt{display:flex;align-items:center;gap:11px;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);margin-bottom:7px;font-size:13px;color:rgba(232,230,223,.52);transition:all .2s}
.ag-opt.ok{background:rgba(126,203,161,.07);border-color:rgba(126,203,161,.22);color:#7ecba1}
.ag-opt-l{width:25px;height:25px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;background:rgba(255,255,255,.06);color:rgba(232,230,223,.36);font-family:'JetBrains Mono',monospace}
.ag-opt.ok .ag-opt-l{background:rgba(126,203,161,.14);color:#7ecba1}
.ag-tick{margin-left:auto;font-size:9px;font-weight:800;color:#7ecba1;text-transform:uppercase;letter-spacing:.1em}
.ag-sa-box{margin-top:8px;padding:13px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.09);border-radius:10px;font-size:13px;color:rgba(232,230,223,.26);font-style:italic}
.ag-model-ans{margin-top:8px;padding:13px;background:rgba(126,203,161,.05);border:1px solid rgba(126,203,161,.18);border-radius:10px;font-size:13px;color:#7ecba1;line-height:1.6}
.ag-model-ans strong{color:#a8e6c4;font-size:9px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:4px}
.ag-error{background:rgba(220,80,80,.06);border:1px solid rgba(220,80,80,.2);border-radius:14px;padding:20px;font-size:13px;color:rgba(220,150,150,.9);line-height:1.6}
.ag-error code{font-family:'JetBrains Mono',monospace;font-size:11px;opacity:.7;display:block;margin-top:6px}

@media(max-width:800px){.ag-grid{grid-template-columns:1fr}.ag-title{font-size:30px}.ag-panel{position:static}}
`;

export default function AssessmentGenerator() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic,   setTopic]   = useState("Quadratic Equations");
  const [type,    setType]    = useState("MCQ");
  const [diff,    setDiff]    = useState("Medium");
  const [count,   setCount]   = useState(5);
  const [generating, setGenerating] = useState(false);
  const [questions,  setQuestions]  = useState(null);
  const [revealed,   setRevealed]   = useState({});
  const [error,      setError]      = useState(null);
  const [exported,   setExported]   = useState(false);

  const handleSubject = (s) => { setSubject(s); setTopic(TOPICS[s][0]); };

  const generate = async () => {
    setGenerating(true); setQuestions(null); setRevealed({}); setError(null);

    const prompt = `You are an expert educator. Generate exactly ${count} ${type} questions on the topic "${topic}" (${subject}) at ${diff} difficulty for high school students.

IMPORTANT: Return ONLY a raw JSON array. No markdown, no backticks, no explanation — just the JSON array itself.

Each element must be an object with these exact keys:
- "q": the question text (string)
- "type": one of "MCQ", "True/False", or "Short Answer" (string)
- "opts": array of option strings — 4 for MCQ, ["True","False"] for True/False, empty array [] for Short Answer
- "ans": integer index of correct option for MCQ/True/False, null for Short Answer
- "modelAnswer": concise model answer string for Short Answer, null otherwise

Output the JSON array only. Start your response with [ and end with ].`;

    try {
      const raw  = await ollamaGenerate(prompt);
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array found in response");
      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) throw new Error("Response is not an array");
      setQuestions(parsed);
    } catch (e) {
      setError("Llama could not generate questions. Make sure Ollama is running and the model is pulled.\n" + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ag-root">
        <div className="ag-blob" style={{ width:500, height:500, background:"rgba(126,203,161,0.05)", top:-120, right:-150 }} />
        <div className="ag-blob" style={{ width:380, height:380, background:"rgba(80,120,200,0.03)", bottom:80, left:-100 }} />

        <div className="ag-layout">
          <div className="ag-header">
            <div>
              <div className="ag-eyebrow">AI-Powered — Ollama</div>
              <h1 className="ag-title">Assessment<br /><span>Generator</span></h1>
            </div>
            <div className="ag-header-meta">
              Running locally, zero latency<br />
              <span className="ag-model-badge">{OLLAMA_MODEL}</span>
            </div>
          </div>

          <div className="ag-grid">
            {/* ── Config Panel ── */}
            <div className="ag-panel">
              <div className="ag-panel-title">Configure Assessment</div>

              {[
                ["Subject",       SUBJECTS,           subject, handleSubject],
                ["Topic",         TOPICS[subject]||[], topic,   setTopic],
                ["Question Type", TYPES,               type,    setType],
              ].map(([lbl, opts, val, fn]) => (
                <div className="ag-field" key={lbl}>
                  <label className="ag-label">{lbl}</label>
                  <div className="ag-sel-wrap">
                    <select className="ag-select" value={val} onChange={e => fn(e.target.value)}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              <div className="ag-field">
                <label className="ag-label">Difficulty Level</label>
                <div className="ag-diff-row">
                  {DIFFS.map(d => (
                    <button key={d} className={`ag-diff-btn${diff===d?" on":""}`} onClick={() => setDiff(d)}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="ag-field">
                <label className="ag-label">Number of Questions</label>
                <div className="ag-count-row">
                  <input type="number" className="ag-num" min={1} max={20} value={count}
                    onChange={e => setCount(Math.min(20, Math.max(1, +e.target.value)))} />
                  <div className="ag-prog">
                    <div className="ag-prog-fill" style={{ width:`${(count/20)*100}%` }} />
                  </div>
                  <span style={{ fontSize:11, color:"rgba(232,230,223,.26)", fontFamily:"'JetBrains Mono',monospace", minWidth:26 }}>/{20}</span>
                </div>
              </div>

              <button className="ag-gen-btn" onClick={generate} disabled={generating}>
                {generating ? "Generating..." : "Generate Assessment"}
              </button>

              <div className="ag-summary">
                {[["Subject",subject],["Topic",topic],["Type",type],["Level",diff],["Count",`${count} Qs`]].map(([l,v]) => (
                  <div className="ag-sum-row" key={l}>
                    <span className="ag-sum-lbl">{l}</span>
                    <span className="ag-sum-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Output ── */}
            <div>
              {!generating && !questions && !error && (
                <div className="ag-empty">
                  <div className="ag-empty-icon"><div className="ag-empty-dot" /></div>
                  <div className="ag-empty-title">Ready to generate</div>
                  <p className="ag-empty-sub">Configure your settings, then click Generate</p>
                </div>
              )}

              {generating && (
                <div className="ag-loading">
                  <div className="ag-spin" />
                  <div className="ag-load-title">Llama is thinking...</div>
                  <p className="ag-load-sub">{topic} &middot; {type} &middot; {diff}</p>
                </div>
              )}

              {error && (
                <div className="ag-error">
                  {error.split("\n")[0]}
                  <code>{error.split("\n").slice(1).join(" ")}</code>
                  <div style={{ marginTop:12, fontSize:12, color:"rgba(220,150,150,.6)" }}>
                    Run: <code style={{ background:"rgba(255,255,255,.06)", padding:"2px 6px", borderRadius:4 }}>ollama pull {OLLAMA_MODEL}</code>
                  </div>
                </div>
              )}

              {questions && !generating && (
                <>
                  <div className="ag-res-header">
                    <div>
                      <span className="ag-res-count">{questions.length} questions generated</span>
                      <span className="ag-res-meta">{subject} &middot; {topic}</span>
                    </div>
                    <div className="ag-actions">
                      <button className="ag-btn-ghost" onClick={generate}>Regenerate</button>
                      <button className="ag-btn-green" onClick={handleExport}>{exported ? "Done!" : "Export"}</button>
                    </div>
                  </div>

                  {questions.map((q, i) => (
                    <div key={i} className="ag-qcard" style={{ animationDelay:`${i*55}ms` }}>
                      <div className="ag-qhead">
                        <div className="ag-qnum">{String(i+1).padStart(2,"0")}</div>
                        <div style={{ flex:1 }}>
                          <div className="ag-qtext">{q.q}</div>
                          <span className="ag-qbadge">{q.type}</span>
                        </div>
                        <button className="ag-reveal"
                          onClick={() => setRevealed(r => ({ ...r, [i]: !r[i] }))}>
                          {revealed[i] ? "Hide" : "Answer"}
                        </button>
                      </div>

                      {q.opts && q.opts.length > 0 && q.opts.map((opt, j) => (
                        <div key={j} className={`ag-opt${revealed[i] && j===q.ans?" ok":""}`}>
                          <div className="ag-opt-l">{String.fromCharCode(65+j)}</div>
                          <span>{opt}</span>
                          {revealed[i] && j===q.ans && <span className="ag-tick">Correct</span>}
                        </div>
                      ))}

                      {(!q.opts || q.opts.length === 0) && !revealed[i] && (
                        <div className="ag-sa-box">Write your answer here...</div>
                      )}

                      {(!q.opts || q.opts.length === 0) && revealed[i] && q.modelAnswer && (
                        <div className="ag-model-ans">
                          <strong>Model Answer</strong>
                          {q.modelAnswer}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
