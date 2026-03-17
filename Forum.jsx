/**
 * Forum.jsx — PathwayAI Discussion Forum
 * Dark #0c0c0f · Syne · Instrument Serif · JetBrains Mono · #7ecba1 accent
 * No emojis · No Tailwind
 */

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { forumData } from "../../data/allData";

const GREEN = "#7ecba1";
const GREEN2 = "#a8e6c4";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body{background:#0c0c0f;color:#e8e6df;font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(126,203,161,.2);border-radius:10px}

@keyframes fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes ping{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}
.fu{animation:fade-up .5s cubic-bezier(.16,1,.3,1) both}

/* ── Layout ── */
.fr-root{display:flex;min-height:100vh;background:#0c0c0f}

/* ── List panel ── */
.fr-list{
  width:320px;flex-shrink:0;height:100vh;overflow-y:auto;
  border-right:1px solid rgba(255,255,255,.07);
  display:flex;flex-direction:column;
}

/* ── List header ── */
.fr-list-head{
  position:sticky;top:0;z-index:10;
  padding:18px 18px 14px;
  background:rgba(12,12,15,.95);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.06);
  display:flex;align-items:center;justify-content:space-between;
}
.fr-list-title{
  font-size:15px;font-weight:800;letter-spacing:-.01em;color:#f0ede6;
}
.fr-new-btn{
  padding:7px 14px;border-radius:9px;border:none;
  background:rgba(126,203,161,.1);
  border:1px solid rgba(126,203,161,.2);
  color:${GREEN};font-family:'Syne',sans-serif;font-size:11px;font-weight:800;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
  transition:all .2s;
}
.fr-new-btn:hover{background:rgba(126,203,161,.18)}

/* ── New post form ── */
.fr-new-form{
  padding:16px 18px;
  border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(126,203,161,.03);
  display:flex;flex-direction:column;gap:8px;
}
.fr-input{
  width:100%;padding:9px 12px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:#e8e6df;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  outline:none;
  transition:border-color .2s;
}
.fr-input:focus{border-color:rgba(126,203,161,.3)}
.fr-input::placeholder{color:rgba(232,230,223,.2)}
.fr-textarea{resize:none}
.fr-select{
  width:100%;padding:9px 12px;border-radius:10px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:rgba(232,230,223,.6);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;
  outline:none;cursor:pointer;
  appearance:none;
}
.fr-form-btns{display:flex;gap:6px}
.fr-post-btn{
  flex:1;padding:9px;border-radius:9px;border:none;
  background:linear-gradient(135deg,${GREEN},${GREEN2},${GREEN});
  background-size:200%;
  color:#0c2018;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .3s;
}
.fr-post-btn:hover{background-position:right}
.fr-cancel-btn{
  padding:9px 14px;border-radius:9px;
  border:1px solid rgba(255,255,255,.1);
  background:transparent;
  color:rgba(232,230,223,.35);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.fr-cancel-btn:hover{border-color:rgba(255,255,255,.2);color:rgba(232,230,223,.6)}

/* ── Post row ── */
.fr-post-row{
  padding:14px 18px;
  border-bottom:1px solid rgba(255,255,255,.05);
  cursor:pointer;
  transition:all .2s;
  background:transparent;
  border-left:3px solid transparent;
}
.fr-post-row:hover{background:rgba(255,255,255,.025)}
.fr-post-row.active{
  background:rgba(126,203,161,.05);
  border-left-color:${GREEN};
}
.fr-post-avatar{
  width:22px;height:22px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;color:white;flex-shrink:0;
}
.fr-post-subject{
  font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  font-family:'JetBrains Mono',monospace;color:rgba(126,203,161,.6);
}
.fr-post-title{
  font-size:13px;font-weight:700;color:#f0ede6;line-height:1.4;
  margin:4px 0;
}
.fr-post-meta{
  font-size:10px;color:rgba(232,230,223,.3);
  font-family:'JetBrains Mono',monospace;
}
.fr-solved-badge{
  font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  padding:2px 8px;border-radius:5px;
  background:rgba(126,203,161,.1);border:1px solid rgba(126,203,161,.2);color:${GREEN};
  font-family:'JetBrains Mono',monospace;
  margin-left:auto;flex-shrink:0;
}

/* ── Detail panel ── */
.fr-detail{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden}

.fr-detail-head{
  padding:20px 28px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:rgba(12,12,15,.95);backdrop-filter:blur(20px);
}
.fr-detail-subject{
  font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;
  color:rgba(126,203,161,.6);font-family:'JetBrains Mono',monospace;margin-bottom:6px;
}
.fr-detail-title{font-size:20px;font-weight:800;letter-spacing:-.02em;color:#f0ede6;line-height:1.25}
.fr-detail-body{font-size:13px;color:rgba(232,230,223,.45);margin-top:8px;line-height:1.75;font-weight:500}

/* ── Replies ── */
.fr-replies{flex:1;overflow-y:auto;padding:20px 28px;display:flex;flex-direction:column;gap:12px}

.fr-reply-card{
  display:flex;gap:12px;
  padding:16px 18px;border-radius:16px;
  border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.025);
  transition:border-color .2s;
}
.fr-reply-card:hover{border-color:rgba(126,203,161,.12)}

.fr-reply-avatar{
  width:32px;height:32px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;color:white;flex-shrink:0;
}
.fr-reply-author{font-size:13px;font-weight:800;color:#f0ede6}
.fr-reply-ts{font-size:10px;color:rgba(232,230,223,.25);font-family:'JetBrains Mono',monospace;margin-left:auto}
.fr-reply-tag{
  font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  padding:2px 8px;border-radius:5px;font-family:'JetBrains Mono',monospace;
}
.fr-reply-body{font-size:13px;color:rgba(232,230,223,.6);line-height:1.75;font-weight:500;margin-top:6px}

.fr-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:8px;opacity:.35}
.fr-empty-icon{width:40px;height:40px;border-radius:12px;background:rgba(126,203,161,.08);border:1px solid rgba(126,203,161,.15);display:flex;align-items:center;justify-content:center}
.fr-empty-text{font-size:13px;font-weight:700;color:rgba(232,230,223,.5)}

/* ── Reply input ── */
.fr-reply-bar{
  padding:16px 28px;
  border-top:1px solid rgba(255,255,255,.07);
  background:rgba(12,12,15,.95);backdrop-filter:blur(20px);
  display:flex;gap:10px;
}
.fr-reply-input{
  flex:1;padding:11px 16px;border-radius:12px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  color:#e8e6df;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;
  outline:none;resize:none;
  transition:border-color .2s;
}
.fr-reply-input:focus{border-color:rgba(126,203,161,.3)}
.fr-reply-input::placeholder{color:rgba(232,230,223,.2)}
.fr-reply-submit{
  align-self:flex-end;
  padding:11px 20px;border-radius:12px;border:none;
  background:linear-gradient(135deg,${GREEN},${GREEN2});
  color:#0c2018;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;cursor:pointer;
  transition:all .25s;white-space:nowrap;
}
.fr-reply-submit:hover{transform:translateY(-1px)}

/* ── Empty state ── */
.fr-select-state{
  flex:1;display:flex;align-items:center;justify-content:center;
  flex-direction:column;gap:10px;opacity:.3;
}

@media(max-width:768px){
  .fr-list{width:100%;border-right:none}
  .fr-detail{display:none}
}
`;

const AVATAR_COLORS = [
  "linear-gradient(135deg,#1D4ED8,#3B82F6)",
  "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "linear-gradient(135deg,#059669,#34D399)",
  "linear-gradient(135deg,#DB2777,#F472B6)",
  "linear-gradient(135deg,#D97706,#FCD34D)",
];

function getAvatarColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function Forum() {
  const { user } = useApp();
  const [posts,    setPosts]    = useState(forumData);
  const [selected, setSelected] = useState(null);
  const [newPost,  setNewPost]  = useState({ title:"", body:"", subject:"Mathematics" });
  const [showNew,  setShowNew]  = useState(false);
  const [replyText,setReplyText]= useState("");

  const submitPost = () => {
    if (!newPost.title.trim()) return;
    const post = {
      id: `f${Date.now()}`, author:"You", avatar:"Y",
      avatarGrad: AVATAR_COLORS[0],
      subject: newPost.subject, title: newPost.title,
      body: newPost.body, timestamp:"just now",
      tags:[], replies:[], views:1, solved:false,
    };
    setPosts(p => [post, ...p]);
    setNewPost({ title:"", body:"", subject:"Mathematics" });
    setShowNew(false);
    setSelected(post);
  };

  const submitReply = () => {
    if (!replyText.trim() || !selected) return;
    const reply = {
      id:`r${Date.now()}`, author:"You", avatar:"Y",
      body:replyText, timestamp:"just now", likes:0,
    };
    const updated = { ...selected, replies:[...selected.replies, reply] };
    setSelected(updated);
    setPosts(p => p.map(po => po.id===selected.id ? updated : po));
    setReplyText("");
  };

  const postView = selected && posts.find(p => p.id === selected.id) || selected;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="fr-root">

        {/* ── POST LIST ── */}
        <div className="fr-list">
          <div className="fr-list-head">
            <span className="fr-list-title">Forum</span>
            <button className="fr-new-btn" onClick={() => setShowNew(v => !v)}>
              {showNew ? "Cancel" : "+ New Post"}
            </button>
          </div>

          {showNew && (
            <div className="fr-new-form">
              <select
                value={newPost.subject}
                onChange={e => setNewPost(p => ({ ...p, subject:e.target.value }))}
                className="fr-select"
              >
                {["Mathematics","Science","History","English","Coding"].map(s => (
                  <option key={s} style={{ background:"#0c0c0f" }}>{s}</option>
                ))}
              </select>
              <input
                className="fr-input"
                placeholder="Your question…"
                value={newPost.title}
                onChange={e => setNewPost(p => ({ ...p, title:e.target.value }))}
              />
              <textarea
                className="fr-input fr-textarea"
                placeholder="Add more details (optional)…"
                rows={2}
                value={newPost.body}
                onChange={e => setNewPost(p => ({ ...p, body:e.target.value }))}
              />
              <div className="fr-form-btns">
                <button className="fr-post-btn" onClick={submitPost}>Post</button>
                <button className="fr-cancel-btn" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </div>
          )}

          {posts.map((post, i) => (
            <div key={post.id}
              className={`fr-post-row fu ${selected?.id===post.id ? "active" : ""}`}
              style={{ animationDelay:`${i*.04}s` }}
              onClick={() => setSelected(post)}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <div className="fr-post-avatar" style={{ background:post.avatarGrad || getAvatarColor(post.author) }}>
                  {post.avatar}
                </div>
                <span className="fr-post-subject">{post.subject}</span>
                {post.solved && <span className="fr-solved-badge">Solved</span>}
              </div>
              <div className="fr-post-title">{post.title}</div>
              <div className="fr-post-meta">
                {post.replies.length} replies · {post.views} views · {post.timestamp}
              </div>
            </div>
          ))}
        </div>

        {/* ── POST DETAIL ── */}
        {postView ? (
          <div className="fr-detail">
            <div className="fr-detail-head">
              <div className="fr-detail-subject">{postView.subject}</div>
              <h2 className="fr-detail-title">{postView.title}</h2>
              {postView.body && <p className="fr-detail-body">{postView.body}</p>}
            </div>

            <div className="fr-replies">
              {postView.replies.length === 0 ? (
                <div className="fr-empty">
                  <div className="fr-empty-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span className="fr-empty-text">No replies yet — be the first to help</span>
                </div>
              ) : (
                postView.replies.map((reply, i) => (
                  <div key={reply.id} className={`fr-reply-card fu`} style={{ animationDelay:`${i*.06}s` }}>
                    <div className="fr-reply-avatar" style={{ background:reply.avatarGrad || getAvatarColor(reply.author) }}>
                      {reply.avatar}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span className="fr-reply-author">{reply.author}</span>
                        {reply.isTeacherVerified && (
                          <span className="fr-reply-tag" style={{ background:"rgba(126,203,161,.1)", border:"1px solid rgba(126,203,161,.2)", color:GREEN }}>Teacher</span>
                        )}
                        {reply.isMentor && (
                          <span className="fr-reply-tag" style={{ background:"rgba(203,168,126,.1)", border:"1px solid rgba(203,168,126,.2)", color:"#cba87e" }}>Mentor</span>
                        )}
                        {reply.isAI && (
                          <span className="fr-reply-tag" style={{ background:"rgba(126,181,203,.1)", border:"1px solid rgba(126,181,203,.2)", color:"#7eb5cb" }}>AI</span>
                        )}
                        <span className="fr-reply-ts">{reply.timestamp}</span>
                      </div>
                      <p className="fr-reply-body">{reply.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="fr-reply-bar">
              <textarea
                className="fr-reply-input"
                rows={2}
                placeholder="Write a reply…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button className="fr-reply-submit" onClick={submitReply}>Reply →</button>
            </div>
          </div>
        ) : (
          <div className="fr-select-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(126,203,161,.4)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:700, color:"rgba(232,230,223,.4)" }}>Select a post to read</span>
          </div>
        )}
      </div>
    </>
  );
}
