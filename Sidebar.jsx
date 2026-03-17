/**
 * Sidebar.jsx — PathwayAI Navigation
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind · No light/dark toggle
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useConn } from "../../context/ConnContext";

const STUDENT_NAV = [
  { label: "Dashboard",   path: "/student/dashboard",   code: "DB" },
  { label: "AI Tutor",    path: "/student/ai-tutor",    code: "AI" },
  { label: "Study Plan",  path: "/student/study-plan",  code: "SP" },
  { label: "Quiz",        path: "/student/quiz",        code: "QZ" },
  { label: "Forum",       path: "/student/forum",       code: "FM" },
  { label: "Mentors",     path: "/student/mentors",     code: "MT" },
  { label: "Credentials", path: "/student/credentials", code: "CR" },
  { label: "Resume",      path: "/student/resume",      code: "RS" },
  { label: "Employers",   path: "/student/employers",   code: "EM" },
];

const TEACHER_NAV = [
  { label: "Dashboard",   path: "/teacher/dashboard",  code: "DB" },
  { label: "Assessments", path: "/teacher/assessment", code: "AS" },
  { label: "Analytics",   path: "/teacher/analytics",  code: "AN" },
  { label: "Resources",   path: "/teacher/resources",  code: "RE" },
];

const MENTOR_NAV = [
  { label: "Dashboard",   path: "/mentor/dashboard",   code: "DB" },
];

function getNav(role) {
  if (role === "teacher") return TEACHER_NAV;
  if (role === "mentor")  return MENTOR_NAV;
  return STUDENT_NAV;
}

const GREEN = "#7ecba1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.sb-root{display:flex;height:100vh;overflow:hidden;background:#0c0c0f;font-family:'Syne',sans-serif}

/* ── Sidebar shell ── */
.sb-sidebar{
  width:220px;flex-shrink:0;height:100vh;
  display:flex;flex-direction:column;
  background:#0c0c0f;
  border-right:1px solid rgba(255,255,255,.07);
  position:relative;z-index:20;
}

/* ── Logo ── */
.sb-logo{
  display:flex;align-items:center;gap:10px;
  padding:20px 18px 16px;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.sb-logo-mark{
  width:32px;height:32px;border-radius:9px;
  background:rgba(126,203,161,.1);
  border:1px solid rgba(126,203,161,.25);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.sb-logo-name{font-size:15px;font-weight:800;letter-spacing:-.02em;color:#f0ede6}
.sb-logo-name span{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:${GREEN}}
.sb-logo-role{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,230,223,.25);font-family:'JetBrains Mono',monospace}

/* ── Conn bar ── */
.sb-conn{
  margin:10px 12px 4px;
  padding:8px 12px;border-radius:10px;
  display:flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;
}
.sb-conn-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.sb-conn-sync{margin-left:auto;opacity:.6}

/* ── Nav ── */
.sb-nav{flex:1;padding:8px 12px;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
.sb-nav::-webkit-scrollbar{width:0}

.sb-link{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;border-radius:10px;
  border:1px solid transparent;
  background:none;cursor:pointer;width:100%;text-align:left;
  font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
  color:rgba(232,230,223,.35);
  transition:all .2s;
}
.sb-link:hover{color:rgba(232,230,223,.75);background:rgba(255,255,255,.04)}
.sb-link.active{
  background:rgba(126,203,161,.08);
  border-color:rgba(126,203,161,.18);
  color:${GREEN};
}
.sb-link-code{
  width:26px;height:26px;border-radius:7px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:500;
  background:rgba(255,255,255,.04);
  transition:all .2s;
}
.sb-link.active .sb-link-code{background:rgba(126,203,161,.12);color:${GREEN}}
.sb-link-active-dot{width:5px;height:5px;border-radius:50%;background:${GREEN};margin-left:auto;flex-shrink:0}

/* ── Bottom ── */
.sb-bottom{
  padding:12px;
  border-top:1px solid rgba(255,255,255,.06);
  display:flex;flex-direction:column;gap:6px;
}
.sb-user{
  display:flex;align-items:center;gap:10px;
  padding:10px 12px;border-radius:12px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.07);
}
.sb-user-avatar{
  width:32px;height:32px;border-radius:9px;
  background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.2);
  display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-size:13px;font-weight:800;color:${GREEN};
  flex-shrink:0;
}
.sb-user-name{font-size:12px;font-weight:800;color:#f0ede6;line-height:1.2}
.sb-user-lang{font-size:10px;color:rgba(232,230,223,.3);font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.sb-logout{
  background:none;border:none;cursor:pointer;
  padding:4px;border-radius:6px;
  color:rgba(232,230,223,.2);
  font-size:14px;
  transition:color .2s;
  margin-left:auto;flex-shrink:0;
}
.sb-logout:hover{color:rgba(203,126,154,.8)}

/* ── Mobile hamburger ── */
.sb-ham{
  display:none;
  position:fixed;top:14px;left:14px;z-index:60;
  width:36px;height:36px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(12,12,15,.9);
  backdrop-filter:blur(12px);
  cursor:pointer;
  flex-direction:column;align-items:center;justify-content:center;gap:4px;
}
.sb-ham-line{width:16px;height:1.5px;background:#e8e6df;border-radius:2px}

.sb-overlay{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.7);backdrop-filter:blur(4px)}
.sb-mobile-panel{position:fixed;left:0;top:0;bottom:0;z-index:55;width:220px}

.sb-main{flex:1;overflow-y:auto;background:#0c0c0f}
.sb-main::-webkit-scrollbar{width:4px}
.sb-main::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@media(max-width:768px){
  .sb-sidebar-desk{display:none!important}
  .sb-ham{display:flex}
}
@media(min-width:769px){
  .sb-ham{display:none}
  .sb-mobile-panel{display:none!important}
}
`;

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 11H2L8 2Z" fill={GREEN} opacity=".85"/>
      <circle cx="8" cy="11" r="2.5" fill={GREEN}/>
    </svg>
  );
}

function SidebarContent({ nav, user, role, conn, pendingSync, location, navigate, onClose, handleLogout }) {
  const connConfig = {
    "4g":      { label:"4G Online",  color:GREEN,                 dot:GREEN },
    "2g":      { label:"2G Lite",    color:"#cba87e",             dot:"#cba87e" },
    "offline": { label:"Offline",    color:"rgba(203,126,154,.8)",dot:"rgba(203,126,154,.8)" },
  };
  const cc = connConfig[conn] || connConfig["4g"];

  return (
    <div className="sb-sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-mark"><LogoMark/></div>
        <div>
          <div className="sb-logo-name">Pathway<span>AI</span></div>
          <div className="sb-logo-role">{role} portal</div>
        </div>
      </div>

      {/* Connectivity */}
      <div className="sb-conn" style={{ background:`${cc.dot}10`, border:`1px solid ${cc.dot}25`, color:cc.color }}>
        <div className="sb-conn-dot" style={{ background:cc.dot, boxShadow:`0 0 5px ${cc.dot}` }}/>
        {cc.label}
        {pendingSync > 0 && <span className="sb-conn-sync">{pendingSync} pending</span>}
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {nav.map(item => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path}
              className={`sb-link ${active ? "active" : ""}`}
              onClick={() => { navigate(item.path); onClose?.(); }}
            >
              <div className="sb-link-code">{item.code}</div>
              {item.label}
              {active && <div className="sb-link-active-dot"/>}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-user-avatar">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="sb-user-name">{user?.name || "Student"}</div>
            <div className="sb-user-lang">{user?.language || "Hindi"}</div>
          </div>
          <button className="sb-logout" onClick={handleLogout} title="Logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ children }) {
  const { user, logout } = useApp();
  const { conn, pendingSync } = useConn();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || "student";
  const nav  = getNav(role);

  const handleLogout = () => { logout(); navigate("/role"); };

  const sidebarProps = { nav, user, role, conn, pendingSync, location, navigate, handleLogout };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="sb-root">

        {/* Desktop sidebar */}
        <div className="sb-sidebar-desk">
          <SidebarContent {...sidebarProps} />
        </div>

        {/* Mobile hamburger */}
        <button className="sb-ham" onClick={() => setMobileOpen(true)}>
          <div className="sb-ham-line"/>
          <div className="sb-ham-line"/>
          <div className="sb-ham-line"/>
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div className="sb-overlay" onClick={() => setMobileOpen(false)}/>
            <div className="sb-mobile-panel">
              <SidebarContent {...sidebarProps} onClose={() => setMobileOpen(false)}/>
            </div>
          </>
        )}

        {/* Main content */}
        <div className="sb-main">{children}</div>
      </div>
    </>
  );
}
