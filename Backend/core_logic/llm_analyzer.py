import os
import json
from dotenv import load_dotenv
from google import genai
from lib.prompts import PROMPT

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables!")

client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_document(text, language="english"):
    """
    Sends the document text to Gemini LLM for:
    1. Simplifying legal language
    2. Highlighting high-risk clauses
    3. Summarizing main points
    4. Optionally translating summary

    Returns:
        dict: {"summary": "...", "risks": [{"clause": "...", "risk": "..."}, ...]}
    """
    prompt = PROMPT

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "temperature": 0.3,
                "max_output_tokens": 3000,
                "response_mime_type": "application/json",
            },
        )
        content = response.text

        result = json.loads(content)
    except Exception as e:
        result = {
            "summary": f"Failed to analyze document: {str(e)}",
            "risks": []
        }

    return result