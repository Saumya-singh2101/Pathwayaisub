/**
 * AuthPage.jsx — redesigned to match Assessment Generator aesthetic
 * src/pages/auth/AuthPage.jsx
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";

// ── Ollama / model badge to stay consistent with the suite ──
const SUITE_MODEL = "llama3";

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Syne', sans-serif; background: #0c0c0f; overflow-x: hidden; }

/* ── Animations ── */
@keyframes blob-drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(28px,-18px) scale(1.05); }
  66%      { transform: translate(-18px,26px) scale(0.96); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-dot {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:.4; transform:scale(.7); }
}
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}

.auth-fade-up   { animation: fade-up .65s cubic-bezier(.16,1,.3,1) both; }
.auth-spin      { animation: spin .85s linear infinite; }
.auth-blob      { animation: blob-drift 16s ease-in-out infinite; }

.d1 { animation-delay: .06s; }
.d2 { animation-delay: .12s; }
.d3 { animation-delay: .18s; }
.d4 { animation-delay: .24s; }
.d5 { animation-delay: .30s; }

/* ── Root ── */
.auth-root {
  min-height: 100vh;
  background: #0c0c0f;
  color: #e8e6df;
  font-family: 'Syne', sans-serif;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* ── Ambient blobs ── */
.auth-blob-el {
  position: fixed;
  border-radius: 50%;
  filter: blur(130px);
  pointer-events: none;
  z-index: 0;
}

/* ── Layout ── */
.auth-left {
  position: relative;
  z-index: 1;
  width: 420px;
  flex-shrink: 0;
  background: rgba(255,255,255,.02);
  border-right: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  padding: 48px 40px 52px;
  min-height: 100vh;
}
.auth-right {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  min-height: 100vh;
  overflow-y: auto;
}

/* ── Logo ── */
.auth-logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 52px;
}
.auth-logo-mark {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: rgba(126,203,161,.12);
  border: 1px solid rgba(126,203,161,.28);
  display: flex; align-items: center; justify-content: center;
}
.auth-logo-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: #f0ede6;
}
.auth-logo-name span {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: #7ecba1;
}

/* ── Left panel content ── */
.auth-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(232,230,223,.3);
  margin-bottom: 10px;
}
.auth-headline {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -.03em;
  color: #f0ede6;
  margin-bottom: 6px;
}
.auth-headline-italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: #7ecba1;
}
.auth-tagline {
  font-size: 13px;
  color: rgba(232,230,223,.38);
  line-height: 1.7;
  margin-bottom: 36px;
}

/* ── Role selector (left panel) ── */
.auth-role-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 40px;
}
.auth-role-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  cursor: pointer;
  transition: all .2s;
  text-align: left;
  font-family: 'Syne', sans-serif;
}
.auth-role-btn:hover {
  border-color: rgba(255,255,255,.16);
  background: rgba(255,255,255,.05);
}
.auth-role-btn.active {
  background: rgba(126,203,161,.08);
  border-color: rgba(126,203,161,.32);
}
.auth-role-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  flex-shrink: 0;
  transition: all .2s;
}
.auth-role-btn.active .auth-role-icon {
  background: rgba(126,203,161,.1);
  border-color: rgba(126,203,161,.25);
}
.auth-role-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(232,230,223,.6);
  transition: color .2s;
  letter-spacing: .01em;
}
.auth-role-btn.active .auth-role-label { color: #7ecba1; }
.auth-role-sub {
  font-size: 11px;
  color: rgba(232,230,223,.28);
  margin-top: 2px;
  font-weight: 400;
}

/* ── Trust badges (bottom of left panel) ── */
.auth-trust {
  margin-top: auto;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.auth-trust-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(232,230,223,.28);
}
.auth-trust-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: rgba(126,203,161,.5);
  flex-shrink: 0;
}
.auth-model-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 5px;
  background: rgba(126,203,161,.09);
  border: 1px solid rgba(126,203,161,.22);
  color: #7ecba1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  margin-top: 10px;
  align-self: flex-start;
}

/* ── Form card ── */
.auth-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 22px;
  padding: 36px 36px 32px;
}

/* ── Mode toggle (Login / Sign Up) ── */
.auth-mode-toggle {
  display: flex;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
}
.auth-mode-btn {
  flex: 1;
  padding: 9px;
  border-radius: 9px;
  border: none;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  transition: all .2s;
  background: transparent;
  color: rgba(232,230,223,.38);
}
.auth-mode-btn.active {
  background: rgba(126,203,161,.14);
  color: #7ecba1;
  border: 1px solid rgba(126,203,161,.3);
}

/* ── Form header ── */
.auth-card-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: rgba(232,230,223,.28);
  margin-bottom: 6px;
}
.auth-card-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: #f0ede6;
  margin-bottom: 4px;
}
.auth-card-sub {
  font-size: 13px;
  color: rgba(232,230,223,.35);
  margin-bottom: 26px;
  line-height: 1.5;
}

/* ── Fields ── */
.auth-field { margin-bottom: 14px; }
.auth-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(232,230,223,.38);
  margin-bottom: 7px;
}
.auth-input-wrap { position: relative; }
.auth-input {
  width: 100%;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  color: #e8e6df;
  outline: none;
  transition: border-color .2s;
}
.auth-input:focus { border-color: rgba(126,203,161,.48); }
.auth-input::placeholder { color: rgba(232,230,223,.2); }
.auth-input.has-suffix { padding-right: 44px; }
.auth-input-suffix {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(232,230,223,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color .2s;
  padding: 0;
}
.auth-input-suffix:hover { color: rgba(232,230,223,.7); }
.auth-select {
  width: 100%;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  color: #e8e6df;
  outline: none;
  transition: border-color .2s;
  appearance: none;
  cursor: pointer;
}
.auth-select:focus { border-color: rgba(126,203,161,.48); }
.auth-select option { background: #1a1a1f; }

/* ── Forgot ── */
.auth-forgot {
  display: block;
  text-align: right;
  font-size: 11px;
  font-weight: 700;
  color: #7ecba1;
  background: none;
  border: none;
  cursor: pointer;
  margin-top: -6px;
  margin-bottom: 4px;
  font-family: 'Syne', sans-serif;
  transition: opacity .2s;
}
.auth-forgot:hover { opacity: .7; }

/* ── Submit button ── */
.auth-submit {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #7ecba1, #a8e6c4, #7ecba1);
  background-size: 200%;
  color: #0c2018;
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .3s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.auth-submit:hover:not(:disabled) {
  background-position: right;
  transform: translateY(-1px);
}
.auth-submit:disabled {
  background: rgba(126,203,161,.22);
  color: rgba(12,32,24,.45);
  cursor: not-allowed;
  transform: none;
}

/* ── Switch mode link ── */
.auth-switch {
  text-align: center;
  font-size: 12px;
  color: rgba(232,230,223,.3);
  margin-top: 16px;
}
.auth-switch-btn {
  color: #7ecba1;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  transition: opacity .2s;
}
.auth-switch-btn:hover { opacity: .7; }

/* ── Banners ── */
.auth-banner {
  border-radius: 11px;
  padding: 11px 14px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 14px;
}
.auth-banner.error {
  background: rgba(220,80,80,.07);
  border: 1px solid rgba(220,80,80,.22);
  color: rgba(220,150,150,.9);
}
.auth-banner.success {
  background: rgba(126,203,161,.07);
  border: 1px solid rgba(126,203,161,.22);
  color: #7ecba1;
}

/* ── Divider ── */
.auth-divider {
  height: 1px;
  background: rgba(255,255,255,.07);
  margin: 20px 0;
}

/* ── Mobile bottom role switcher ── */
.auth-mobile-roles {
  display: none;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.auth-mobile-role-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.1);
  background: transparent;
  color: rgba(232,230,223,.38);
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
}
.auth-mobile-role-btn.active {
  border-color: rgba(126,203,161,.32);
  color: #7ecba1;
  background: rgba(126,203,161,.08);
}

@media (max-width: 860px) {
  .auth-left { display: none; }
  .auth-right { padding: 36px 20px 60px; }
  .auth-mobile-roles { display: flex; }
  .auth-card { padding: 28px 22px; }
}
`;

const ROLE_CONFIG = {
  student: {
    icon: "◆",
    label: "Student",
    tagline: "Your learning journey starts here.",
    sub: "Access assessments, track progress",
    extraSignup: [
      { id: "class",    label: "Class / Grade",      type: "text",   placeholder: "e.g. Class 10 or 12th" },
      { id: "language", label: "Preferred Language", type: "select",
        options: ["English","Hindi","Marathi","Tamil","Bengali","Telugu","Kannada","Urdu","Gujarati"] },
    ],
    dashboard: "/student/dashboard",
  },
  teacher: {
    icon: "▲",
    label: "Teacher",
    tagline: "Empower your classroom with real intelligence.",
    sub: "Create assessments, view analytics",
    extraSignup: [
      { id: "school",  label: "School Name",       type: "text", placeholder: "e.g. Govt. High School, Pune" },
      { id: "subject", label: "Subject(s) Taught", type: "text", placeholder: "e.g. Mathematics, Science" },
    ],
    dashboard: "/teacher/dashboard",
  },
  mentor: {
    icon: "●",
    label: "Peer Mentor",
    tagline: "Teach others. Build credentials. Earn while you learn.",
    sub: "Guide students, earn rewards",
    extraSignup: [
      { id: "subject", label: "Subject Expertise",    type: "text", placeholder: "e.g. Mathematics" },
      { id: "upi",     label: "UPI ID (for payouts)", type: "text", placeholder: "e.g. yourname@upi" },
    ],
    dashboard: "/mentor/dashboard",
  },
};

/* ── SVG Icons ── */
const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect width="22" height="22" rx="6" fill="rgba(126,203,161,0.15)"/>
    <path d="M5 5.5h6a4 4 0 0 1 0 8H5V5.5z" fill="#7ecba1" fillOpacity=".9"/>
    <circle cx="16.5" cy="15.5" r="2.5" fill="#7ecba1" fillOpacity=".7"/>
    <line x1="16.5" y1="5.5" x2="16.5" y2="11.5" stroke="#7ecba1" strokeWidth="2" strokeLinecap="round" strokeOpacity=".7"/>
  </svg>
);

const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="3" y1="3" x2="21" y2="21"/>
  </svg>
);

const Spinner = () => (
  <svg className="auth-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* ── Field component ── */
function Field({ id, label, type="text", placeholder, value, onChange, required, options, children }) {
  const isSelect = type === "select";
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      {isSelect ? (
        <div style={{ position:"relative" }}>
          <select id={id} className="auth-select" value={value} onChange={onChange} required={required}>
            <option value="">Select...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", color:"rgba(232,230,223,.3)", pointerEvents:"none", fontSize:10 }}>▾</span>
        </div>
      ) : (
        <div className="auth-input-wrap">
          <input
            id={id}
            className={`auth-input${children ? " has-suffix" : ""}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
          />
          {children && <span className="auth-input-suffix">{children}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function AuthPage() {
  const navigate    = useNavigate();
  const { mode = "login", role = "student" } = useParams();
  const { signIn, signUp } = useApp();

  const cfg    = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  const isLogin = mode === "login";

  const [form,        setForm]        = useState({ name:"", email:"", phone:"", password:"", confirm:"", class:"", language:"English", school:"", subject:"", upi:"" });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");

  useEffect(() => { setError(""); setSuccessMsg(""); }, [mode, role]);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!isLogin && form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!isLogin && form.password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await signIn({ email: form.email, password: form.password, role });
        navigate(cfg.dashboard);
      } else {
        await signUp({ ...form, role });
        setSuccessMsg("Account created! Check your email to verify.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = Object.entries(ROLE_CONFIG).map(([id, c]) => ({ id, ...c }));

  return (
    <>
      <style>{AUTH_CSS}</style>
      <div className="auth-root">
        {/* Ambient blobs */}
        <div className="auth-blob-el auth-blob" style={{ width:500, height:500, background:"rgba(126,203,161,0.055)", top:-140, right:-100 }} />
        <div className="auth-blob-el" style={{ width:360, height:360, background:"rgba(80,110,200,0.035)", bottom:60, left:-80, filter:"blur(110px)" }} />

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          {/* Logo */}
          <div className="auth-logo-row auth-fade-up">
            <div className="auth-logo-mark"><LogoMark /></div>
            <div className="auth-logo-name">Pathway<span>AI</span></div>
          </div>

          {/* Headline */}
          <div className="auth-fade-up d1" style={{ marginBottom:6 }}>
            <div className="auth-eyebrow">AI-Powered — {SUITE_MODEL}</div>
          </div>
          <h2 className="auth-headline auth-fade-up d2">
            Learn<br />
            <span className="auth-headline-italic">smarter.</span>
          </h2>
          <p className="auth-tagline auth-fade-up d3">{cfg.tagline}</p>

          {/* Role selector */}
          <div className="auth-role-list">
            {roles.map((r, i) => (
              <button
                key={r.id}
                className={`auth-role-btn auth-fade-up d${i+3}`}
                onClick={() => { setError(""); setSuccessMsg(""); navigate(`/${mode}/${r.id}`); }}
                style={{ ...(role === r.id ? {} : {}) }}
                data-active={role === r.id}
              >
                <div className="auth-role-icon" style={role === r.id ? {} : {}}>
                  <span style={{ fontSize:16, color: role===r.id ? "#7ecba1" : "rgba(232,230,223,.4)" }}>{r.icon}</span>
                </div>
                <div>
                  <div className="auth-role-label">{r.label}</div>
                  <div className="auth-role-sub">{r.sub}</div>
                </div>
                {role === r.id && (
                  <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#7ecba1", flexShrink:0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Trust + model badge */}
          <div className="auth-trust auth-fade-up d5">
            <div className="auth-trust-row"><div className="auth-trust-dot" /><span>All data stays on your device</span></div>
            <div className="auth-trust-row"><div className="auth-trust-dot" /><span>No third-party tracking</span></div>
            <div className="auth-trust-row"><div className="auth-trust-dot" /><span>Ollama-powered, locally run</span></div>
            <div className="auth-model-badge">{SUITE_MODEL}</div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-card auth-fade-up">
            {/* Mode toggle */}
            <div className="auth-mode-toggle">
              {["login","signup"].map(m => (
                <button
                  key={m}
                  className={`auth-mode-btn${mode === m ? " active" : ""}`}
                  onClick={() => { setError(""); setSuccessMsg(""); navigate(`/${m}/${role}`); }}
                >
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Card header */}
            <div className="auth-card-eyebrow">{cfg.label} Portal</div>
            <div className="auth-card-title">{isLogin ? "Welcome back" : "Create your account"}</div>
            <div className="auth-card-sub">
              {isLogin
                ? `Sign in to your ${cfg.label.toLowerCase()} account to continue.`
                : `Join as a ${cfg.label.toLowerCase()} and get started today.`}
            </div>

            {/* Banners */}
            {error      && <div className="auth-banner error">{error}</div>}
            {successMsg && <div className="auth-banner success">{successMsg}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <Field id="name" label="Full Name" placeholder="Your full name"
                  value={form.name} onChange={set("name")} required />
              )}

              <Field id="email" label="Email Address" type="email" placeholder="you@email.com"
                value={form.email} onChange={set("email")} required />

              {!isLogin && (
                <Field id="phone" label="Mobile Number" type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={set("phone")} />
              )}

              {!isLogin && cfg.extraSignup.map(f => (
                <Field key={f.id} id={f.id} label={f.label} type={f.type}
                  placeholder={f.placeholder} options={f.options}
                  value={form[f.id]} onChange={set(f.id)} />
              ))}

              <Field id="password" label="Password"
                type={showPass ? "text" : "password"}
                placeholder={isLogin ? "Your password" : "Min 6 characters"}
                value={form.password} onChange={set("password")} required>
                <button type="button" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </Field>

              {!isLogin && (
                <Field id="confirm" label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm} onChange={set("confirm")} required>
                  <button type="button" onClick={() => setShowConfirm(s => !s)}>
                    {showConfirm ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </Field>
              )}

              {isLogin && (
                <button type="button" className="auth-forgot">Forgot password?</button>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <><Spinner />{isLogin ? "Signing in..." : "Creating account..."}</>
                ) : (
                  isLogin ? `Log in as ${cfg.label}` : `Create ${cfg.label} Account`
                )}
              </button>
            </form>

            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => { setError(""); setSuccessMsg(""); navigate(`/${isLogin ? "signup" : "login"}/${role}`); }}
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>

          {/* Mobile role switcher */}
          <div className="auth-mobile-roles">
            {roles.map(r => (
              <button
                key={r.id}
                className={`auth-mobile-role-btn${role===r.id?" active":""}`}
                onClick={() => { setError(""); setSuccessMsg(""); navigate(`/${mode}/${r.id}`); }}
              >
                <span>{r.icon}</span> {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
