from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import mediapipe as mp
import requests
import math

from routes.resume_ai import router as resume_router

app = FastAPI()
app.include_router(resume_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AI CHAT ----------------

@app.post("/ask-ai")
async def ask_ai(data: dict):
    prompt = data.get("question")
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "llama3", "prompt": prompt, "stream": False}
    )
    result = response.json()
    return {"answer": result["response"]}


# ---------------- STUDY PLAN ----------------

@app.post("/study-plan")
async def generate_plan(data: dict):

    subject = data.get("subject")
    hours = data.get("hours")

    prompt = f"""
Return ONLY the format below. Do not add explanations.

TITLE: Weekly Study Plan
SUMMARY: One sentence summary
GOAL: One sentence goal

DAY: Monday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Tuesday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Wednesday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Thursday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Friday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Saturday
TOPIC: <topic name>
TASK: <task>
TASK: <task>
TASK: <task>

DAY: Sunday
REST

Subject: {subject}
Hours per day: {hours}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

        result = response.json()
        ai_text = result.get("response", "")

        return {"plan": ai_text}

    except Exception as e:
        return {
            "plan": f"TITLE: Error\nSUMMARY: {str(e)}\nGOAL: Fix backend\nDAY: Monday\nREST"
        }

# ================================================================
# SIGN LANGUAGE DETECTION — FIXED & RELIABLE
# ================================================================

mp_hands = mp.solutions.hands
hands_detector = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

# ----------------------------------------------------------------
# Core helpers
# ----------------------------------------------------------------

def dist2d(a, b):
    return math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)


def get_finger_states(lm):
    """
    Robust finger-extension check.
    - Compares tip Y vs MCP Y with a small tolerance.
    - Thumb uses distance from palm centre (landmark 9).
    """
    tip_ids = [8, 12, 16, 20]
    mcp_ids = [5,  9, 13, 17]
    names   = ["index", "middle", "ring", "pinky"]

    fingers = {}

    # Thumb: extended if tip is farther from wrist than knuckle
    fingers["thumb"] = dist2d(lm[4], lm[0]) > dist2d(lm[2], lm[0])

    # Other four fingers: tip above MCP by at least 2 % of normalised height
    for name, tip_i, mcp_i in zip(names, tip_ids, mcp_ids):
        fingers[name] = (lm[tip_i].y + 0.02) < lm[mcp_i].y

    return fingers


def count_up(fingers):
    return sum(fingers.values())


# ----------------------------------------------------------------
# ASL classifier
# ----------------------------------------------------------------

def classify_asl(lm, fingers):
    t = fingers["thumb"]
    i = fingers["index"]
    m = fingers["middle"]
    r = fingers["ring"]
    p = fingers["pinky"]
    n = count_up(fingers)

    # 0 fingers
    if n == 0:
        # A = fist, thumb beside; S = thumb tucked over
        return ("S", "Fist - ASL S") if lm[4].x < lm[8].x else ("A", "Fist - ASL A")

    # 1 finger
    if n == 1:
        if i: return ("D", "Index up - ASL D")
        if p: return ("I", "Pinky up - ASL I")
        if t: return ("A", "Thumb up - ASL A")
        if m: return ("D", "ASL D variant")

    # 2 fingers
    if n == 2:
        if i and m:
            spread = abs(lm[8].x - lm[12].x)
            return ("V", "Peace - ASL V") if spread > 0.05 else ("U", "Two together - ASL U")
        if t and i:
            return ("F", "Circle - ASL F") if dist2d(lm[4], lm[8]) < 0.05 else ("L", "L-shape - ASL L")
        if t and p:
            return ("Y", "Thumb+Pinky - ASL Y")
        if i and p:
            return ("H", "Horns - ASL H / ILY")

    # 3 fingers
    if n == 3:
        if i and m and r:  return ("W", "Three fingers - ASL W")
        if t and i and m:  return ("K", "K shape - ASL K")
        if i and m and p:  return ("W", "ASL W variant")

    # 4 fingers
    if n == 4:
        if not t: return ("B", "Four up, thumb tucked - ASL B")
        return ("4", "Four fingers with thumb")

    # 5 fingers
    if n == 5:
        if lm[12].y < lm[0].y - 0.1:
            return ("HELLO", "Open hand raised - HELLO")
        return ("5", "Open hand - ASL 5")

    return ("?", f"{n} fingers up")


def classify_two_hands(lm1, lm2, f1, f2):
    c1, c2 = count_up(f1), count_up(f2)
    total = c1 + c2
    if total == 0:           return "STOP"
    if c1 >= 4 and c2 >= 4: return "HELP ME"
    if total >= 8:           return "OPEN / YES PLEASE"
    if c1 == 1 and c2 == 1: return "I HAVE A QUESTION"
    return f"TWO HANDS ({c1}+{c2})"


# ----------------------------------------------------------------
# Detect endpoint
# ----------------------------------------------------------------

@app.post("/detect-sign")
async def detect_sign(file: UploadFile = File(...)):
    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Could not decode image", "letter": "", "fingers_up": 0}

    img = cv2.resize(img, (640, 480))
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    result = hands_detector.process(rgb)

    if not result.multi_hand_landmarks:
        return {"fingers_up": 0, "letter": "", "sign": "", "note": "No hand detected", "hands_detected": 0}

    # Single hand
    if len(result.multi_hand_landmarks) == 1:
        lm      = result.multi_hand_landmarks[0].landmark
        fingers = get_finger_states(lm)
        letter, note = classify_asl(lm, fingers)
        return {
            "fingers_up":    count_up(fingers),
            "letter":        letter,
            "sign":          letter,
            "note":          note,
            "fingers":       fingers,
            "hands_detected": 1
        }

    # Two hands
    lm1 = result.multi_hand_landmarks[0].landmark
    lm2 = result.multi_hand_landmarks[1].landmark
    f1  = get_finger_states(lm1)
    f2  = get_finger_states(lm2)
    sign = classify_two_hands(lm1, lm2, f1, f2)
    return {
        "fingers_up":    count_up(f1) + count_up(f2),
        "letter":        sign,
        "sign":          sign,
        "note":          "Two-hand sign",
        "hands_detected": 2
    }


# ----------------------------------------------------------------
# Llama-powered endpoints
# ----------------------------------------------------------------

@app.post("/sign-conversation")
async def sign_conversation(data: dict):
    signs: list = data.get("signs", [])
    context: str = data.get("context", "classroom")

    if not signs:
        return {"reply": "I didn't catch any sign. Please try again!", "interpreted": ""}

    signs_str = " → ".join(signs)
    prompt = f"""You are a helpful, friendly AI assistant on an educational platform for students who are deaf or hard of hearing.

A student signed this sequence:
"{signs_str}"

Context: {context}

1. Interpret what they likely meant (combine letters into words if needed).
2. Respond warmly as a teacher — answer, encourage, or clarify.
3. Keep it SHORT (2-3 sentences) and simple.
4. If unsure, ask one gentle clarifying question.

Reply directly to the student."""

    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},
            timeout=30
        )
        reply = r.json().get("response", "I'm here to help! Could you try again?")
    except Exception:
        reply = "Sorry, couldn't reach the AI. Please try again."

    return {"interpreted": signs_str, "reply": reply}


@app.post("/sign-to-text")
async def sign_to_text(data: dict):
    signs: list = data.get("signs", [])
    if not signs:
        return {"sentence": ""}

    prompt = f"""Convert this ASL detection sequence into a clean English sentence.
Signs: {" ".join(signs)}
- Combine letter-by-letter spellings into words.
- Keep recognised phrase signs as-is.
- Return ONLY the sentence, nothing else."""

    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},
            timeout=20
        )
        sentence = r.json().get("response", " ".join(signs)).strip()
    except Exception:
        sentence = " ".join(signs)

    return {"sentence": sentence}