import { useState, useRef, useEffect, useCallback } from "react";

const CAPTURE_INTERVAL_MS = 1200;
const SILENCE_TIMEOUT_MS = 2800;
const MIN_SENTENCE_SIGNS = 2;

export default function SignLanguageDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const silenceRef = useRef(null);
  const streamRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [currentSign, setCurrentSign] = useState(null);
  const [signBuffer, setSignBuffer] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [aiReply, setAiReply] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [fingers, setFingers] = useState(null);

  const signBufferRef = useRef([]);

  useEffect(() => {
    signBufferRef.current = signBuffer;
  }, [signBuffer]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error("Camera error:", e);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      try {
        const res = await fetch("http://localhost:8000/detect-sign", { method: "POST", body: formData });
        const data = await res.json();
        if (data.letter && data.letter !== "" && data.letter !== "?") {
          setCurrentSign(data.letter);
          setHandCount(data.hands_detected || 0);
          setFingers(data.fingers || null);
          setSignBuffer(prev => {
            if (prev[prev.length - 1] === data.letter) return prev;
            return [...prev, data.letter];
          });
          if (silenceRef.current) clearTimeout(silenceRef.current);
          silenceRef.current = setTimeout(() => finalizeSentence(), SILENCE_TIMEOUT_MS);
        } else {
          setCurrentSign(null);
          setHandCount(0);
          setFingers(null);
        }
      } catch (e) { console.error("Detection error:", e); }
    }, "image/jpeg", 0.85);
  }, []);

  const finalizeSentence = useCallback(async () => {
    const signs = signBufferRef.current;
    if (signs.length < MIN_SENTENCE_SIGNS) { setSignBuffer([]); return; }
    setIsThinking(true);
    try {
      const textRes = await fetch("http://localhost:8000/sign-to-text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signs })
      });
      const textData = await textRes.json();
      const sentence = textData.sentence || signs.join(" ");

      const convRes = await fetch("http://localhost:8000/sign-conversation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signs, context: "classroom" })
      });
      const convData = await convRes.json();
      setSentences(prev => [...prev, { raw: signs.join(" → "), sentence, reply: convData.reply }]);
      setAiReply(convData.reply);
    } catch (e) { console.error("AI error:", e); }
    finally { setIsThinking(false); setSignBuffer([]); }
  }, []);

  const toggleDetection = async () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      clearTimeout(silenceRef.current);
      stopCamera();
      setIsRunning(false);
      setCurrentSign(null);
      setHandCount(0);
    } else {
      await startCamera();
      setIsRunning(true);
      setSignBuffer([]);
      setAiReply("");
      intervalRef.current = setInterval(captureFrame, CAPTURE_INTERVAL_MS);
    }
  };

  const clearAll = () => { setSentences([]); setAiReply(""); setSignBuffer([]); };

  useEffect(() => () => { clearInterval(intervalRef.current); clearTimeout(silenceRef.current); stopCamera(); }, []);

  const fingerNames = ["thumb", "index", "middle", "ring", "pinky"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Courier New', monospace", color: "#e8e8e0" }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,180,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,180,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, borderBottom: "1px solid rgba(0,255,180,0.15)", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🤟</span>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "0.12em", color: "#00ffb4", textTransform: "uppercase" }}>
              SignSense
            </h1>
            <span style={{
              fontSize: 10, background: "rgba(0,255,180,0.12)", color: "#00ffb4",
              border: "1px solid rgba(0,255,180,0.3)", borderRadius: 4, padding: "2px 8px", letterSpacing: "0.2em"
            }}>LIVE</span>
          </div>
          <p style={{ margin: 0, color: "rgba(232,232,224,0.45)", fontSize: 12, letterSpacing: "0.08em" }}>
            SHOW YOUR HANDS · SIGNS DETECTED AUTOMATICALLY · AI BUILDS YOUR SENTENCE
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Camera */}
          <div>
            <div style={{
              position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3",
              border: isRunning ? "1px solid rgba(0,255,180,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: "#0e0e14",
              boxShadow: isRunning ? "0 0 30px rgba(0,255,180,0.1)" : "none",
              transition: "all 0.4s ease"
            }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(-1)" }} muted playsInline />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {!isRunning && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "rgba(10,10,15,0.85)" }}>
                  <span style={{ fontSize: 48, opacity: 0.4 }}>📷</span>
                  <p style={{ margin: 0, color: "rgba(232,232,224,0.4)", fontSize: 12, letterSpacing: "0.1em" }}>CAMERA INACTIVE</p>
                </div>
              )}

              {isRunning && currentSign && (
                <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,255,180,0.15)", border: "1px solid rgba(0,255,180,0.5)", borderRadius: 8, padding: "8px 16px" }}>
                  <span style={{ color: "#00ffb4", fontSize: 22, fontWeight: 700 }}>{currentSign}</span>
                </div>
              )}

              {isRunning && (
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(10,10,15,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: handCount > 0 ? "#00ffb4" : "rgba(232,232,224,0.3)", letterSpacing: "0.1em" }}>
                  {handCount > 0 ? `${handCount} HAND${handCount > 1 ? "S" : ""}` : "NO HAND"}
                </div>
              )}

              {isThinking && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.7)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ffb4", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <p style={{ margin: "12px 0 0", color: "#00ffb4", fontSize: 11, letterSpacing: "0.15em" }}>BUILDING SENTENCE...</p>
                </div>
              )}
            </div>

            <button onClick={toggleDetection} style={{
              width: "100%", marginTop: 14, padding: "14px",
              background: isRunning ? "rgba(255,60,80,0.12)" : "rgba(0,255,180,0.12)",
              border: `1px solid ${isRunning ? "rgba(255,60,80,0.4)" : "rgba(0,255,180,0.4)"}`,
              borderRadius: 8, color: isRunning ? "#ff3c50" : "#00ffb4",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer",
              textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s ease"
            }}>
              {isRunning ? "⏹ STOP DETECTION" : "▶ START DETECTION"}
            </button>

            {fingers && (
              <div style={{ marginTop: 14, padding: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, color: "rgba(232,232,224,0.4)", letterSpacing: "0.15em" }}>FINGER STATE</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {fingerNames.map(name => (
                    <div key={name} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        width: "100%", height: 32, borderRadius: 4,
                        background: fingers[name] ? "rgba(0,255,180,0.25)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${fingers[name] ? "rgba(0,255,180,0.5)" : "rgba(255,255,255,0.08)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                      }}>
                        {fingers[name] ? "▲" : "▽"}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 9, color: "rgba(232,232,224,0.35)" }}>{name.slice(0,3).toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ padding: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, minHeight: 90 }}>
              <p style={{ margin: "0 0 12px", fontSize: 10, color: "rgba(232,232,224,0.35)", letterSpacing: "0.15em" }}>
                SIGN BUFFER {signBuffer.length > 0 && `(${signBuffer.length})`}
              </p>
              {signBuffer.length === 0 ? (
                <p style={{ margin: 0, color: "rgba(232,232,224,0.2)", fontSize: 13 }}>
                  {isRunning ? "Start signing with your hands..." : "Press Start to begin"}
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {signBuffer.map((s, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 5, fontSize: 13, fontWeight: 700,
                      background: i === signBuffer.length - 1 ? "rgba(0,255,180,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${i === signBuffer.length - 1 ? "rgba(0,255,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: i === signBuffer.length - 1 ? "#00ffb4" : "#e8e8e0", transition: "all 0.3s"
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 18, background: "rgba(0,255,180,0.04)", border: "1px solid rgba(0,255,180,0.12)", borderRadius: 10, minHeight: 90, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span>🤖</span>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(0,255,180,0.6)", letterSpacing: "0.15em" }}>AI ASSISTANT (LLAMA 3)</p>
              </div>
              {isThinking ? (
                <p style={{ margin: 0, color: "rgba(0,255,180,0.5)", fontSize: 13, fontStyle: "italic" }}>Interpreting your signs...</p>
              ) : aiReply ? (
                <p style={{ margin: 0, color: "#e8e8e0", fontSize: 14, lineHeight: 1.7 }}>{aiReply}</p>
              ) : (
                <p style={{ margin: 0, color: "rgba(232,232,224,0.2)", fontSize: 13 }}>Sign a phrase and pause — I'll respond!</p>
              )}
            </div>

            <div style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "rgba(232,232,224,0.3)", letterSpacing: "0.15em" }}>HOW IT WORKS</p>
              {[["▶","Press Start — camera activates"],["🤟","Show ASL signs with both hands"],["⏸","Pause for ~3 sec to finalize"],["💬","AI turns signs into a sentence & replies"]].map(([icon, text], i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, minWidth: 18 }}>{icon}</span>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(232,232,224,0.45)", lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        {sentences.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(232,232,224,0.35)", letterSpacing: "0.15em" }}>CONVERSATION HISTORY ({sentences.length})</p>
              <button onClick={clearAll} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,232,224,0.4)", fontSize: 10, padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.1em" }}>CLEAR</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sentences.map((s, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ background: "rgba(0,255,180,0.15)", border: "1px solid rgba(0,255,180,0.3)", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#00ffb4", whiteSpace: "nowrap" }}>YOU</span>
                    <p style={{ margin: 0, fontSize: 14, color: "#e8e8e0", lineHeight: 1.5 }}>
                      <strong style={{ color: "#00ffb4" }}>{s.sentence}</strong>
                      <span style={{ fontSize: 11, color: "rgba(232,232,224,0.3)", marginLeft: 8 }}>[{s.raw}]</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "rgba(100,100,255,0.12)", border: "1px solid rgba(100,100,255,0.25)", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#8888ff", whiteSpace: "nowrap" }}>AI</span>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(232,232,224,0.7)", lineHeight: 1.6 }}>{s.reply}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
    </div>
  );
}