/**
 * Employers.jsx — PathwayAI Browse Employers + AI Resume Builder
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const GREEN  = "#7ecba1";
const GREEN2 = "#a8e6c4";

const HARDCODED_RESUME = {
  name: "Sarthak Sharma",
  tagline: "Aspiring Software Development Engineer · Web Dev · DSA · SQL",
  email: "sarthak@gmail.com",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  linkedin: "linkedin.com/in/sarthaksharma",
  summary: "Motivated Computer Science student with hands-on experience building full-stack web applications. Proficient in Data Structures & Algorithms, SQL, and modern web technologies. Passionate about clean, scalable code and solving real-world engineering challenges. Actively seeking an SDE role.",
  education: [
    { school: "SSHS (Senior Secondary High School)", degree: "Class 12 — Science (PCM) · CBSE", year: "2024", score: "95%" },
    { school: "SSHS (Senior Secondary High School)", degree: "Class 10 · CBSE",                  year: "2022", score: "95%" },
  ],
  skills: ["JavaScript","React.js","Node.js","SQL","Data Structures & Algorithms","HTML","CSS","Git","REST APIs","MongoDB"],
  projects: [
    { name:"To-Do App", tech:"React, Node.js, MongoDB", description:"Full-stack To-Do application with user authentication, task prioritisation, and deadline reminders. Implemented RESTful APIs and a responsive React frontend with real-time updates and persistent storage via MongoDB." },
  ],
  experience: [],
  achievements: [
    "Scored 95% in both Class 10 and Class 12 CBSE Board Examinations",
    "Solved 50+ DSA problems on LeetCode — arrays, linked lists, trees, dynamic programming",
    "Completed full-stack web development coursework covering React, Node.js, and databases",
  ],
};

const LOADING_STEPS = [
  { msg:"Initialising local model…",       sub:"Connecting to Llama…" },
  { msg:"Analysing profile & skills…",     sub:"Parsing education, projects, target role…" },
  { msg:"Generating resume structure…",    sub:"Building sections: summary, education, skills…" },
  { msg:"Writing professional summary…",   sub:"Tailoring objective for target role…" },
  { msg:"Optimising for ATS keywords…",    sub:"Adding action verbs and impact metrics…" },
  { msg:"Polishing final output…",         sub:"Formatting and reviewing…" },
];

const EMPLOYERS = [
  { id:1,  name:"Tata Consultancy Services", short:"TCS",  logo:"TCS",  logoColor:"linear-gradient(135deg,#0057A8,#00AEEF)", type:"IT & Services",    location:"Pan India",               roles:["Software Engineer Intern","Junior Developer","Data Analyst"], stipend:"Rs 15k–25k/mo",  openings:120, skills:["Python","Java","SQL","Communication"],           verified:true,  about:"India's largest IT company hiring fresh graduates across all engineering streams." },
  { id:2,  name:"Infosys",                    short:"INFY", logo:"INFY", logoColor:"linear-gradient(135deg,#007CC3,#00BCD4)", type:"IT & Consulting",  location:"Bangalore, Pune, Hyd",    roles:["Systems Engineer","Technology Analyst"],               stipend:"Rs 12k–20k/mo",  openings:85,  skills:["JavaScript","Python","Problem Solving","Agile"],       verified:true,  about:"Global leader in next-generation digital services and consulting." },
  { id:3,  name:"Flipkart",                   short:"FK",   logo:"FK",   logoColor:"linear-gradient(135deg,#F7931E,#FFB347)", type:"E-Commerce",       location:"Bangalore",               roles:["Product Intern","Data Science Intern","SDE Intern"],    stipend:"Rs 20k–40k/mo",  openings:30,  skills:["Python","Machine Learning","Product Thinking","SQL"],  verified:true,  about:"India's leading e-commerce marketplace with cutting-edge tech challenges." },
  { id:4,  name:"Zomato",                     short:"ZMT",  logo:"ZMT",  logoColor:"linear-gradient(135deg,#E23744,#FF6B6B)", type:"Food Tech",        location:"Gurgaon (Remote OK)",     roles:["Growth Intern","Data Analyst","Backend Intern"],        stipend:"Rs 18k–35k/mo",  openings:22,  skills:["Analytics","SQL","Communication","Python"],           verified:true,  about:"Leading food delivery platform solving hyper-local logistics at massive scale." },
  { id:5,  name:"ISRO",                       short:"ISRO", logo:"ISRO", logoColor:"linear-gradient(135deg,#FF6600,#FF9900)", type:"Space & Research", location:"Bangalore, Ahmedabad",    roles:["Junior Research Fellow","Technical Assistant","Intern"], stipend:"Rs 8k–18k/mo",   openings:15,  skills:["Mathematics","Physics","C++","Research"],             verified:true,  about:"India's national space agency — real satellite missions and space tech." },
  { id:6,  name:"Byju's",                     short:"BYJ",  logo:"BYJ",  logoColor:"linear-gradient(135deg,#6C3CE1,#A78BFA)", type:"EdTech",           location:"Bangalore (Remote)",      roles:["Content Developer","Tutor Intern","UX Researcher"],     stipend:"Rs 10k–22k/mo",  openings:40,  skills:["Communication","Subject Expertise","Curriculum"],     verified:false, about:"World's most valued EdTech company creating engaging learning content." },
];

const STEPS = [
  { id:"personal",     title:"Personal Info",   code:"01" },
  { id:"education",    title:"Education",        code:"02" },
  { id:"skills",       title:"Skills",           code:"03" },
  { id:"projects",     title:"Projects",         code:"04" },
  { id:"experience",   title:"Experience",       code:"05" },
  { id:"achievements", title:"Achievements",     code:"06" },
  { id:"target",       title:"Target Role",      code:"07" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes scale-in{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes blob-drift{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-18px)scale(1.04)}66%{transform:translate(-18px,22px)scale(.97)}}
@keyframes dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}
@keyframes prog-fill{from{width:0}to{width:var(--w)}}
@keyframes progress-fill{from{width:0%}to{width:100%}}
@keyframes spin{to{transform:rotate(360deg)}}

.fu{animation:fade-up .5s cubic-bezier(.16,1,.3,1) both}
.si{animation:scale-in .45s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}
.d4{animation-delay:.16s}.d5{animation-delay:.2s}.d6{animation-delay:.24s}

/* ── Root ── */
.ep-root{min-height:100vh;background:#0c0c0f;position:relative;overflow-x:hidden}
.ep-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}

/* ── Topbar ── */
.ep-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(12,12,15,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:14px 28px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;
}
.ep-topbar-title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:#f0ede6;flex:1}

/* ── Btns ── */
.ep-btn-ghost{
  padding:9px 18px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.55);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.ep-btn-ghost:hover{border-color:rgba(255,255,255,.2);color:#e8e6df}
.ep-btn-primary{
  padding:11px 22px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${GREEN},${GREEN2},${GREEN});background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.ep-btn-primary:hover{background-position:right;transform:translateY(-1px)}
.ep-btn-primary:disabled{opacity:.35;cursor:default;transform:none}
.ep-btn-amber{
  padding:11px 22px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#cba87e,#e8c89a);
  color:#1a1000;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.ep-btn-amber:hover{transform:translateY(-1px)}

/* ── Card ── */
.ep-card{
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.07);
  border-radius:20px;
  position:relative;overflow:hidden;
  transition:border-color .25s,transform .25s;
}
.ep-card:hover{border-color:rgba(126,203,161,.14);transform:translateY(-3px)}

/* ── Field ── */
.ep-field{
  width:100%;padding:11px 14px;border-radius:11px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:#e8e6df;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  outline:none;transition:border-color .2s;
}
.ep-field:focus{border-color:rgba(126,203,161,.3)}
.ep-field::placeholder{color:rgba(232,230,223,.2)}
textarea.ep-field{resize:vertical;min-height:70px}

/* ── Label ── */
.ep-lbl{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,230,223,.3);font-family:'JetBrains Mono',monospace;margin-bottom:6px;display:block}

/* ── Tag ── */
.ep-tag{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
  background:rgba(126,203,161,.08);border:1px solid rgba(126,203,161,.2);color:${GREEN};
}
.ep-tag-x{cursor:pointer;opacity:.6;font-size:13px;line-height:1;transition:opacity .15s}
.ep-tag-x:hover{opacity:1}

/* ── Step dot ── */
.ep-step-dot{
  width:28px;height:28px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;
  transition:all .3s;flex-shrink:0;
}
.ep-step-line{flex:1;height:2px;transition:background .3s}

/* ── Resume ── */
.ep-resume{font-family:'Syne',sans-serif;line-height:1.6;padding:36px;border-radius:20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.08)}
.ep-res-section{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;color:${GREEN};padding-bottom:6px;margin-bottom:14px;border-bottom:1px solid rgba(126,203,161,.2)}

/* ── Editable ── */
.ep-edit{position:relative;border-radius:6px;transition:all .2s;cursor:text}
.ep-edit:hover{background:rgba(126,203,161,.05);outline:1px dashed rgba(126,203,161,.3)}
.ep-edit:focus-within{background:rgba(126,203,161,.07);outline:2px solid rgba(126,203,161,.4)}

/* ── Version pill ── */
.ep-vpill{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 11px;border-radius:20px;font-size:10px;font-weight:700;
  cursor:pointer;transition:all .2s;
  border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);
  color:rgba(232,230,223,.3);font-family:'JetBrains Mono',monospace;
}
.ep-vpill:hover,.ep-vpill.active{border-color:rgba(126,203,161,.3);color:${GREEN};background:rgba(126,203,161,.08)}

/* ── Gen dot ── */
.ep-dot{width:10px;height:10px;border-radius:50%;background:${GREEN};display:inline-block}
.ep-dot:nth-child(1){animation:dot-bounce 1.4s 0s infinite ease-in-out}
.ep-dot:nth-child(2){animation:dot-bounce 1.4s .2s infinite ease-in-out}
.ep-dot:nth-child(3){animation:dot-bounce 1.4s .4s infinite ease-in-out}

.ep-content{position:relative;z-index:1;max-width:1000px;margin:0 auto;padding:32px 28px}
`;

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = (v) => { const t=v.trim(); if(t && !tags.includes(t)) onChange([...tags,t]); setInput(""); };
  const remove = (t) => onChange(tags.filter(x=>x!==t));
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:6,padding:"8px 10px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",minHeight:42,alignItems:"center" }}>
      {tags.map(t => <span key={t} className="ep-tag">{t}<span className="ep-tag-x" onClick={()=>remove(t)}>×</span></span>)}
      <input value={input} placeholder={tags.length===0?placeholder:"Add more…"}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();add(input);}if(e.key==="Backspace"&&!input&&tags.length)remove(tags[tags.length-1]);}}
        onBlur={()=>input&&add(input)}
        style={{ border:"none",background:"transparent",outline:"none",fontSize:12,color:"#e8e6df",fontFamily:"'Syne',sans-serif",fontWeight:600,minWidth:100,flex:1 }}
      />
    </div>
  );
}

function EditableField({ value, onChange, multiline, style, isEdited }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const commit = () => { setEditing(false); if(draft!==value) onChange(draft); };
  if (editing) {
    const sh = { value:draft, onChange:e=>setDraft(e.target.value), onBlur:commit, onKeyDown:e=>{if(!multiline&&e.key==="Enter")commit();if(e.key==="Escape"){setDraft(value);setEditing(false);}}, autoFocus:true, style:{...style,background:"rgba(126,203,161,.07)",border:"2px solid rgba(126,203,161,.4)",borderRadius:6,padding:"2px 6px",outline:"none",fontFamily:"inherit",fontSize:"inherit",fontWeight:"inherit",color:"inherit",width:"100%",resize:multiline?"vertical":"none"} };
    return multiline ? <textarea rows={3} {...sh}/> : <input {...sh}/>;
  }
  return (
    <div className="ep-edit" style={{ position:"relative" }} onClick={()=>setEditing(true)}>
      {isEdited && <span style={{ position:"absolute",top:2,left:-10,width:5,height:5,borderRadius:"50%",background:"#cba87e",flexShrink:0 }}/>}
      <span style={style}>{value}</span>
    </div>
  );
}

function ResumeViewer({ resume, onEdit, editedFields }) {
  const field = (key, val, opts={}) => (
    <EditableField key={key} value={val||""} onChange={v=>onEdit(key,v)} multiline={opts.multiline} style={opts.style} isEdited={editedFields.has(key)}/>
  );
  return (
    <div className="ep-resume">
      {/* Header */}
      <div style={{ marginBottom:24,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:"#f0ede6",letterSpacing:"-.02em",marginBottom:4 }}>
          {field("name",resume.name,{style:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:"#f0ede6",letterSpacing:"-.02em"}})}
        </div>
        {field("tagline",resume.tagline,{style:{fontSize:13,color:GREEN,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}})}
        <div style={{ display:"flex",flexWrap:"wrap",gap:14,marginTop:10,fontSize:12,color:"rgba(232,230,223,.45)",fontFamily:"'JetBrains Mono',monospace" }}>
          {[["email",resume.email],["phone",resume.phone],["location",resume.location],["linkedin",resume.linkedin]].map(([k,v])=>v&&(
            <span key={k}>{field(k,v,{style:{fontSize:12,color:"rgba(232,230,223,.45)",fontFamily:"'JetBrains Mono',monospace"}})}</span>
          ))}
        </div>
      </div>

      {resume.summary && (
        <div style={{ marginBottom:22 }}>
          <div className="ep-res-section">Summary</div>
          {field("summary",resume.summary,{multiline:true,style:{fontSize:13,color:"rgba(232,230,223,.6)",lineHeight:1.75,fontWeight:500}})}
        </div>
      )}
      {resume.education?.length>0 && (
        <div style={{ marginBottom:22 }}>
          <div className="ep-res-section">Education</div>
          {resume.education.map((edu,i)=>(
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6 }}>
                {field(`edu_${i}_school`,edu.school,{style:{fontSize:14,fontWeight:800,color:"#f0ede6"}})}
                {field(`edu_${i}_year`,edu.year,{style:{fontSize:12,color:"rgba(232,230,223,.35)",fontStyle:"italic"}})}
              </div>
              {field(`edu_${i}_degree`,edu.degree,{style:{fontSize:13,color:"rgba(232,230,223,.5)",marginTop:2,fontWeight:500}})}
              {edu.score&&field(`edu_${i}_score`,edu.score,{style:{fontSize:12,color:GREEN,fontWeight:700,marginTop:2}})}
            </div>
          ))}
        </div>
      )}
      {resume.skills?.length>0 && (
        <div style={{ marginBottom:22 }}>
          <div className="ep-res-section">Skills</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {resume.skills.map((s,i)=>(
              <span key={i} style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.18)",color:GREEN }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {resume.projects?.length>0 && (
        <div style={{ marginBottom:22 }}>
          <div className="ep-res-section">Projects</div>
          {resume.projects.map((p,i)=>(
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                {field(`proj_${i}_name`,p.name,{style:{fontSize:14,fontWeight:800,color:"#f0ede6"}})}
                {p.tech&&field(`proj_${i}_tech`,p.tech,{style:{fontSize:11,color:GREEN,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}})}
              </div>
              {field(`proj_${i}_desc`,p.description,{multiline:true,style:{fontSize:13,color:"rgba(232,230,223,.5)",marginTop:4,lineHeight:1.65,fontWeight:500}})}
            </div>
          ))}
        </div>
      )}
      {resume.achievements?.length>0 && (
        <div style={{ marginBottom:22 }}>
          <div className="ep-res-section">Achievements</div>
          {resume.achievements.map((a,i)=>(
            <div key={i} style={{ display:"flex",gap:10,marginBottom:8,alignItems:"flex-start" }}>
              <span style={{ color:GREEN,marginTop:2,flexShrink:0,fontFamily:"'JetBrains Mono',monospace",fontSize:11 }}>▸</span>
              {field(`ach_${i}`,a,{style:{fontSize:13,color:"rgba(232,230,223,.55)",fontWeight:500}})}
            </div>
          ))}
        </div>
      )}
      <div style={{ textAlign:"center",paddingTop:18,borderTop:"1px solid rgba(255,255,255,.06)",marginTop:8 }}>
        <span style={{ fontSize:9,color:"rgba(232,230,223,.2)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".12em" }}>BUILT WITH PATHWAYAI · VERIFIED CREDENTIALS</span>
      </div>
    </div>
  );
}

export default function Employers() {
  const navigate = useNavigate();
  const { user }  = useApp();

  const [screen,          setScreen]          = useState("employers");
  const [wizStep,         setWizStep]         = useState(0);
  const [loadStep,        setLoadStep]        = useState(0);
  const [resume,          setResume]          = useState(null);
  const [editedFields,    setEditedFields]    = useState(new Set());
  const [versions,        setVersions]        = useState([]);
  const [activeVersion,   setActiveVersion]   = useState(0);
  const [genError,        setGenError]        = useState(null);
  const [selectedEmployer,setSelectedEmployer]= useState(null);

  const [form, setForm] = useState({
    name:user?.name||"", email:user?.email||"", phone:"", location:"", linkedin:"", github:"",
    school:"", schoolYear:"", schoolScore:"",
    college:"", degree:"", collegeYear:"", collegeScore:"",
    techSkills:[], softSkills:[],
    projects:[{ name:"", tech:"", description:"" }],
    experience:[{ role:"", company:"", duration:"", description:"" }],
    achievements:[""],
    targetRole:"", targetCompany:"", targetTone:"professional",
  });

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const canNext = () => {
    if(wizStep===0) return form.name && form.email;
    if(wizStep===1) return form.school;
    if(wizStep===2) return form.techSkills.length>0;
    return true;
  };

  const generateResume = () => {
    setScreen("generating"); setGenError(null); setLoadStep(0);
    let i=0;
    const iv = setInterval(()=>{
      i++;
      setLoadStep(i);
      if(i>=LOADING_STEPS.length){
        clearInterval(iv);
        const built = {
          ...HARDCODED_RESUME,
          name:form.name||HARDCODED_RESUME.name,
          email:form.email||HARDCODED_RESUME.email,
          phone:form.phone||HARDCODED_RESUME.phone,
          location:form.location||HARDCODED_RESUME.location,
          linkedin:form.linkedin||HARDCODED_RESUME.linkedin,
          skills:form.techSkills.length>0 ? [...new Set([...form.techSkills,...form.softSkills,...HARDCODED_RESUME.skills])].slice(0,16) : HARDCODED_RESUME.skills,
          projects:form.projects.filter(p=>p.name).length>0 ? form.projects.filter(p=>p.name) : HARDCODED_RESUME.projects,
          achievements:form.achievements.filter(Boolean).length>1 ? form.achievements.filter(Boolean) : HARDCODED_RESUME.achievements,
        };
        setTimeout(()=>{
          setVersions([{ label:"AI Draft v1", resume:built, editedFields:new Set() }]);
          setActiveVersion(0); setResume(built); setEditedFields(new Set());
          setScreen("resume");
        },300);
      }
    }, Math.floor(7000/LOADING_STEPS.length));
  };

  const handleEdit = useCallback((key,value)=>{
    setVersions(prev=>{
      const nv=[...prev];
      if(!editedFields.has(key)) nv.push({ label:`Edit ${editedFields.size+1}`, resume:{...resume}, editedFields:new Set(editedFields) });
      return nv;
    });
    setResume(prev=>{
      const parts=key.split("_");
      if(parts[0]==="edu")  { const i=parseInt(parts[1]),f=parts.slice(2).join("_"),a=[...(prev.education||[])];  a[i]={...a[i],[f]:value}; return {...prev,education:a}; }
      if(parts[0]==="proj") { const i=parseInt(parts[1]),f=parts.slice(2).join("_"),a=[...(prev.projects||[])];   a[i]={...a[i],[f]:value}; return {...prev,projects:a}; }
      if(parts[0]==="exp")  { const i=parseInt(parts[1]),f=parts.slice(2).join("_"),a=[...(prev.experience||[])]; a[i]={...a[i],[f]:value}; return {...prev,experience:a}; }
      if(parts[0]==="ach")  { const i=parseInt(parts[1]),a=[...(prev.achievements||[])]; a[i]=value; return {...prev,achievements:a}; }
      return {...prev,[key]:value};
    });
    setEditedFields(prev=>new Set([...prev,key]));
    setActiveVersion(versions.length);
  },[resume,editedFields,versions]);

  const restoreVersion = (idx)=>{
    const v=versions[idx]; if(!v) return;
    setResume({...v.resume}); setEditedFields(new Set(v.editedFields)); setActiveVersion(idx);
  };

  const renderWizStep = () => {
    switch(wizStep) {
      case 0: return (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            <div><span className="ep-lbl">Full Name *</span><input className="ep-field" value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Your Name"/></div>
            <div><span className="ep-lbl">Email *</span><input className="ep-field" type="email" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="you@email.com"/></div>
            <div><span className="ep-lbl">Phone</span><input className="ep-field" value={form.phone} onChange={e=>setF("phone",e.target.value)} placeholder="+91 98765 43210"/></div>
            <div><span className="ep-lbl">City / Location</span><input className="ep-field" value={form.location} onChange={e=>setF("location",e.target.value)} placeholder="Mumbai, Maharashtra"/></div>
            <div><span className="ep-lbl">LinkedIn URL</span><input className="ep-field" value={form.linkedin} onChange={e=>setF("linkedin",e.target.value)} placeholder="linkedin.com/in/you"/></div>
            <div><span className="ep-lbl">GitHub</span><input className="ep-field" value={form.github} onChange={e=>setF("github",e.target.value)} placeholder="github.com/you"/></div>
          </div>
        </div>
      );
      case 1: return (
        <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:"rgba(232,230,223,.65)",marginBottom:10 }}>School / Class 10–12</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
              <div style={{ gridColumn:"span 3" }}><span className="ep-lbl">School Name *</span><input className="ep-field" value={form.school} onChange={e=>setF("school",e.target.value)} placeholder="SSHS, Delhi Public School…"/></div>
              <div><span className="ep-lbl">Board & Stream</span><input className="ep-field" value={form.schoolYear} onChange={e=>setF("schoolYear",e.target.value)} placeholder="CBSE · Science"/></div>
              <div><span className="ep-lbl">Year</span><input className="ep-field" value={form.collegeYear} onChange={e=>setF("collegeYear",e.target.value)} placeholder="2024"/></div>
              <div><span className="ep-lbl">Score</span><input className="ep-field" value={form.schoolScore} onChange={e=>setF("schoolScore",e.target.value)} placeholder="95%"/></div>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div><span className="ep-lbl">Technical Skills *</span><TagInput tags={form.techSkills} onChange={v=>setF("techSkills",v)} placeholder="Type a skill and press Enter…"/></div>
          <div><span className="ep-lbl">Soft Skills</span><TagInput tags={form.softSkills} onChange={v=>setF("softSkills",v)} placeholder="Communication, Leadership…"/></div>
        </div>
      );
      case 3: return (
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          {form.projects.map((p,i)=>(
            <div key={i} style={{ padding:16,borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                <div><span className="ep-lbl">Project Name</span><input className="ep-field" value={p.name} onChange={e=>{const a=[...form.projects];a[i]={...a[i],name:e.target.value};setF("projects",a);}} placeholder="To-Do App, Portfolio…"/></div>
                <div><span className="ep-lbl">Tech Stack</span><input className="ep-field" value={p.tech} onChange={e=>{const a=[...form.projects];a[i]={...a[i],tech:e.target.value};setF("projects",a);}} placeholder="React, Node.js, MongoDB"/></div>
              </div>
              <span className="ep-lbl">Description</span>
              <textarea className="ep-field" rows={2} value={p.description} onChange={e=>{const a=[...form.projects];a[i]={...a[i],description:e.target.value};setF("projects",a);}} placeholder="What you built and what impact it had…"/>
            </div>
          ))}
          {form.projects.length<4 && (
            <button className="ep-btn-ghost" style={{ alignSelf:"flex-start",padding:"7px 14px",fontSize:11 }}
              onClick={()=>setF("projects",[...form.projects,{name:"",tech:"",description:""}])}>+ Add Project</button>
          )}
        </div>
      );
      case 4: return (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <p style={{ fontSize:13,color:"rgba(232,230,223,.4)",fontWeight:500 }}>Add any internships or work experience. Skip if none.</p>
          {form.experience.map((ex,i)=>(
            <div key={i} style={{ padding:16,borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.025)" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                <div><span className="ep-lbl">Job Title</span><input className="ep-field" value={ex.role} onChange={e=>{const a=[...form.experience];a[i]={...a[i],role:e.target.value};setF("experience",a);}} placeholder="SDE Intern"/></div>
                <div><span className="ep-lbl">Company</span><input className="ep-field" value={ex.company} onChange={e=>{const a=[...form.experience];a[i]={...a[i],company:e.target.value};setF("experience",a);}} placeholder="TCS, Startup…"/></div>
              </div>
              <textarea className="ep-field" rows={2} value={ex.description} onChange={e=>{const a=[...form.experience];a[i]={...a[i],description:e.target.value};setF("experience",a);}} placeholder="What you did and achieved…"/>
            </div>
          ))}
        </div>
      );
      case 5: return (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {form.achievements.map((a,i)=>(
            <div key={i} style={{ display:"flex",gap:8,alignItems:"center" }}>
              <input className="ep-field" style={{ flex:1 }} value={a} onChange={e=>{const ac=[...form.achievements];ac[i]=e.target.value;setF("achievements",ac);}} placeholder="State Math Olympiad Winner 2023…"/>
              {i>0 && <button onClick={()=>setF("achievements",form.achievements.filter((_,j)=>j!==i))} style={{ background:"none",border:"none",color:"rgba(203,126,154,.7)",cursor:"pointer",fontSize:18,padding:"0 4px" }}>×</button>}
            </div>
          ))}
          {form.achievements.length<6 && (
            <button className="ep-btn-ghost" style={{ alignSelf:"flex-start",padding:"7px 14px",fontSize:11 }}
              onClick={()=>setF("achievements",[...form.achievements,""])}>+ Add Achievement</button>
          )}
        </div>
      );
      case 6: return (
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div><span className="ep-lbl">Target Job Role *</span><input className="ep-field" value={form.targetRole} onChange={e=>setF("targetRole",e.target.value)} placeholder="Software Engineer Intern, SDE…"/></div>
          <div><span className="ep-lbl">Target Company (optional)</span><input className="ep-field" value={form.targetCompany} onChange={e=>setF("targetCompany",e.target.value)} placeholder="TCS, Flipkart…"/></div>
          <div>
            <span className="ep-lbl">Resume Tone</span>
            <div style={{ display:"flex",gap:8 }}>
              {[{id:"professional",label:"Professional",desc:"Corporate & formal"},{id:"dynamic",label:"Dynamic",desc:"Bold & energetic"},{id:"academic",label:"Academic",desc:"Research-focused"}].map(tone=>(
                <button key={tone.id} onClick={()=>setF("targetTone",tone.id)} style={{
                  flex:1,padding:"10px 8px",borderRadius:12,cursor:"pointer",
                  border:`1px solid ${form.targetTone===tone.id?"rgba(126,203,161,.3)":"rgba(255,255,255,.08)"}`,
                  background:form.targetTone===tone.id?"rgba(126,203,161,.08)":"rgba(255,255,255,.025)",
                  color:form.targetTone===tone.id?GREEN:"rgba(232,230,223,.4)",fontWeight:700,fontSize:12,
                  fontFamily:"'Syne',sans-serif",transition:"all .2s",
                }}>
                  {tone.label}<br/><span style={{ fontWeight:500,fontSize:11 }}>{tone.desc}</span>
                </button>
              ))}
            </div>
          </div>
          {selectedEmployer && (
            <div style={{ padding:"12px 14px",borderRadius:11,background:"rgba(126,203,161,.05)",border:"1px solid rgba(126,203,161,.2)" }}>
              <p style={{ fontSize:11,color:GREEN,fontWeight:800,marginBottom:3,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",textTransform:"uppercase" }}>Optimising for {selectedEmployer.name}</p>
              <p style={{ fontSize:12,color:"rgba(232,230,223,.4)",fontWeight:500 }}>Skills targeted: {selectedEmployer.skills.join(", ")}</p>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  /* ── SCREEN: Employers ── */
  if (screen === "employers") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="ep-root">
        <div className="ep-blob" style={{ width:500,height:500,background:"rgba(126,203,161,.05)",top:-140,right:-120 }}/>
        <div className="ep-topbar">
          <button className="ep-btn-ghost" onClick={()=>navigate("/student/dashboard")}>← Dashboard</button>
          <span className="ep-topbar-title">Browse Employers</span>
          <button className="ep-btn-amber" onClick={()=>setScreen("wizard")}>Build AI Resume</button>
        </div>
        <div className="ep-content">
          <div className="fu" style={{ textAlign:"center",marginBottom:36 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.2)",marginBottom:16 }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:GREEN }}/>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:GREEN,fontFamily:"'JetBrains Mono',monospace" }}>{EMPLOYERS.length} Employers Actively Hiring</span>
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4.5vw,42px)",fontWeight:800,letterSpacing:"-.03em",color:"#f0ede6",lineHeight:1.1,marginBottom:10 }}>
              Your career{" "}
              <span style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontWeight:400,color:GREEN }}>starts here.</span>
            </h1>
            <p style={{ fontSize:14,color:"rgba(232,230,223,.35)",maxWidth:440,margin:"0 auto 24px",lineHeight:1.75,fontWeight:500 }}>Browse top companies hiring from PathwayAI. Select one to tailor your AI resume.</p>
            <button className="ep-btn-amber" style={{ fontSize:14,padding:"13px 32px" }} onClick={()=>setScreen("wizard")}>Generate My AI Resume with Llama →</button>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18 }}>
            {EMPLOYERS.map((emp,i)=>(
              <div key={emp.id} className={`ep-card fu d${(i%6)+1}`} style={{ padding:22,cursor:"pointer" }}>
                <div style={{ display:"flex",gap:14,alignItems:"flex-start",marginBottom:14 }}>
                  <div style={{ width:48,height:48,borderRadius:14,background:emp.logoColor,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"white",flexShrink:0 }}>{emp.logo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:"#f0ede6" }}>{emp.name}</span>
                      {emp.verified && (
                        <span style={{ padding:"2px 8px",borderRadius:5,fontSize:9,fontWeight:800,background:"rgba(126,203,161,.1)",border:"1px solid rgba(126,203,161,.2)",color:GREEN,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em" }}>Verified</span>
                      )}
                    </div>
                    <div style={{ fontSize:11,color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace" }}>{emp.type} · {emp.location}</div>
                  </div>
                  <div style={{ padding:"3px 10px",borderRadius:5,fontSize:9,fontWeight:800,background:"rgba(126,203,161,.08)",border:"1px solid rgba(126,203,161,.2)",color:GREEN,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,letterSpacing:".06em" }}>{emp.openings} open</div>
                </div>

                <p style={{ fontSize:12,color:"rgba(232,230,223,.4)",marginBottom:12,lineHeight:1.6,fontWeight:500 }}>{emp.about}</p>

                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(232,230,223,.3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:7 }}>Open Roles</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                    {emp.roles.map(r=>(
                      <span key={r} style={{ padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"rgba(232,230,223,.4)" }}>{r}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom:14,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(232,230,223,.25)",fontFamily:"'JetBrains Mono',monospace",marginBottom:5 }}>Skills wanted</div>
                  <div style={{ fontSize:12,color:"rgba(232,230,223,.4)",fontWeight:500 }}>{emp.skills.join(" · ")}</div>
                </div>

                <div style={{ display:"flex",gap:8 }}>
                  <button className="ep-btn-primary" style={{ flex:1,padding:"10px" }} onClick={()=>{ setSelectedEmployer(emp);setF("targetCompany",emp.name);setF("targetRole",emp.roles[0]);setScreen("wizard"); }}>
                    Build Resume for {emp.short}
                  </button>
                  <div style={{ padding:"10px 12px",borderRadius:12,background:"rgba(126,203,161,.06)",border:"1px solid rgba(126,203,161,.15)",fontSize:12,fontWeight:700,color:GREEN,fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap",display:"flex",alignItems:"center" }}>{emp.stipend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ── SCREEN: Wizard ── */
  if (screen === "wizard") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="ep-root">
        <div className="ep-blob" style={{ width:460,height:460,background:"rgba(126,203,161,.04)",top:-120,right:-100 }}/>
        <div className="ep-topbar">
          <button className="ep-btn-ghost" onClick={()=>setScreen("employers")}>← Back</button>
          <span className="ep-topbar-title">AI Resume Builder
            {selectedEmployer && <span style={{ fontSize:12,fontWeight:500,color:"rgba(232,230,223,.3)",marginLeft:8 }}>· For {selectedEmployer.name}</span>}
          </span>
          <span style={{ fontSize:11,color:"rgba(232,230,223,.25)",fontFamily:"'JetBrains Mono',monospace" }}>Step {wizStep+1} / {STEPS.length}</span>
        </div>
        <div className="ep-content" style={{ maxWidth:680 }}>
          {/* Step progress */}
          <div style={{ display:"flex",alignItems:"center",gap:0,marginBottom:32 }}>
            {STEPS.map((s,i)=>(
              <div key={s.id} style={{ display:"contents" }}>
                <div className="ep-step-dot" style={{
                  background:i<wizStep?"rgba(126,203,161,.2)":i===wizStep?"rgba(126,203,161,.12)":"rgba(255,255,255,.04)",
                  color:i<wizStep?GREEN:i===wizStep?GREEN:"rgba(232,230,223,.25)",
                  border:`1px solid ${i<=wizStep?"rgba(126,203,161,.3)":"rgba(255,255,255,.08)"}`,
                  cursor:i<wizStep?"pointer":"default",
                  boxShadow:i===wizStep?`0 0 0 4px rgba(126,203,161,.12)`:"none",
                }} onClick={()=>i<wizStep&&setWizStep(i)} title={s.title}>
                  {i<wizStep ? (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"/></svg>
                  ) : (
                    <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700 }}>{s.code}</span>
                  )}
                </div>
                {i<STEPS.length-1 && <div className="ep-step-line" style={{ background:i<wizStep?"rgba(126,203,161,.3)":"rgba(255,255,255,.07)" }}/>}
              </div>
            ))}
          </div>

          <div className="ep-card" style={{ padding:26,marginBottom:18 }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,letterSpacing:"-.02em",color:"#f0ede6",marginBottom:4 }}>{STEPS[wizStep].title}</h2>
            </div>
            {renderWizStep()}
          </div>

          {genError && <div style={{ padding:"11px 16px",borderRadius:11,background:"rgba(203,126,154,.08)",border:"1px solid rgba(203,126,154,.25)",color:"#cb7e9a",fontSize:13,fontWeight:700,marginBottom:14 }}>{genError}</div>}

          <div style={{ display:"flex",gap:10,justifyContent:"space-between" }}>
            <button className="ep-btn-ghost" onClick={()=>wizStep>0?setWizStep(w=>w-1):setScreen("employers")}>
              {wizStep===0?"Cancel":"← Back"}
            </button>
            <div style={{ display:"flex",gap:10 }}>
              {wizStep<STEPS.length-1 ? (
                <>
                  <button className="ep-btn-ghost" onClick={()=>setWizStep(w=>w+1)}>Skip</button>
                  <button className="ep-btn-primary" disabled={!canNext()} onClick={()=>setWizStep(w=>w+1)}>Next →</button>
                </>
              ) : (
                <button className="ep-btn-amber" style={{ fontSize:14,padding:"12px 28px" }} onClick={generateResume} disabled={!form.name||!form.email}>
                  Generate Resume with Llama →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ── SCREEN: Generating ── */
  if (screen === "generating") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="ep-root" style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh" }}>
        <div style={{ textAlign:"center",padding:40,maxWidth:400 }}>
          <div style={{ width:80,height:80,borderRadius:"50%",background:"rgba(126,203,161,.1)",border:"2px solid rgba(126,203,161,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"-.02em",color:"#f0ede6",marginBottom:8 }}>Llama is Building Your Resume…</h2>
          <p style={{ color:GREEN,fontSize:13,fontWeight:700,marginBottom:4 }}>{LOADING_STEPS[Math.min(loadStep,LOADING_STEPS.length-1)].msg}</p>
          <p style={{ color:"rgba(232,230,223,.35)",fontSize:12,marginBottom:24,fontWeight:500 }}>{LOADING_STEPS[Math.min(loadStep,LOADING_STEPS.length-1)].sub}</p>
          <div style={{ display:"flex",gap:10,justifyContent:"center",marginBottom:32 }}>
            <span className="ep-dot"/><span className="ep-dot"/><span className="ep-dot"/>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8,textAlign:"left" }}>
            {LOADING_STEPS.map((step,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10,fontSize:12,color:loadStep>i?GREEN:loadStep===i?"#f0ede6":"rgba(232,230,223,.25)",fontWeight:loadStep>=i?700:500 }}>
                <div style={{ width:16,height:16,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,background:loadStep>i?"rgba(126,203,161,.12)":"rgba(255,255,255,.04)",border:`1px solid ${loadStep>i?"rgba(126,203,161,.3)":"rgba(255,255,255,.08)"}`,color:loadStep>i?GREEN:"rgba(232,230,223,.3)" }}>
                  {loadStep>i ? "✓" : i+1}
                </div>
                {step.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ── SCREEN: Resume ── */
  if (screen === "resume") return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="ep-root">
        <div className="ep-topbar">
          <button className="ep-btn-ghost" onClick={()=>setScreen("employers")}>← Employers</button>
          <span className="ep-topbar-title">
            Your Resume
            {editedFields.size>0 && <span style={{ marginLeft:8,fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(203,168,126,.12)",border:"1px solid rgba(203,168,126,.25)",color:"#cba87e",fontFamily:"'JetBrains Mono',monospace",fontWeight:800 }}>{editedFields.size} edits</span>}
          </span>
          {versions.length>1 && (
            <div style={{ display:"flex",alignItems:"center",gap:6,overflowX:"auto",maxWidth:280 }}>
              {versions.map((v,i)=>(
                <button key={i} className={`ep-vpill ${activeVersion===i?"active":""}`} onClick={()=>restoreVersion(i)}>
                  {i===0?"Draft":`v${i}`}{activeVersion===i&&" ←"}
                </button>
              ))}
            </div>
          )}
          <button className="ep-btn-ghost" style={{ fontSize:11 }} onClick={()=>setScreen("wizard")}>Regenerate</button>
          <button className="ep-btn-primary" style={{ fontSize:11 }} onClick={()=>window.print()}>Download PDF</button>
        </div>
        <div className="ep-content" style={{ maxWidth:780 }}>
          <div style={{ padding:"10px 14px",borderRadius:11,background:"rgba(126,203,161,.04)",border:"1px solid rgba(126,203,161,.15)",display:"flex",alignItems:"center",gap:10,marginBottom:16,fontSize:12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span style={{ color:"rgba(232,230,223,.5)",fontWeight:600 }}>Click any text to edit inline. Changes appear in the edits counter above.</span>
          </div>
          {resume && <ResumeViewer resume={resume} onEdit={handleEdit} editedFields={editedFields}/>}
        </div>
      </div>
    </>
  );

  return null;
}
