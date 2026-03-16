
from fastapi import APIRouter
import requests

router = APIRouter()

@router.post("/ask-ai")
async def ask_ai(data: dict):
    prompt = data.get("question")

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()
    return {"answer": result["response"]}