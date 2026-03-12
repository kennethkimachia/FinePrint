import os
import json
import mimetypes
from dotenv import load_dotenv
from google import genai
from google.genai import types
from lib.prompts import build_prompt

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables!")

client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_document(file_path, language="english"):
    """
    Sends the raw document file to Gemini 2.0 Flash (multimodal).
    Gemini extracts the text and analyzes it for contract risks.

    Args:
        file_path: Absolute path to the uploaded PDF or image file.
        language: Language for the executive summary output.

    Returns:
        dict with keys: executive_summary, overall_risk_score, risk_findings
    """
    prompt = build_prompt(language)

    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/pdf"

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    file_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[file_part, prompt],
            config={
                "temperature": 0.3,
                "max_output_tokens": 4000,
                "response_mime_type": "application/json",
            },
        )
        content = response.text
        result = json.loads(content)
    except Exception as e:
        result = {
            "executive_summary": f"Failed to analyze document: {str(e)}",
            "overall_risk_score": 0,
            "risk_findings": []
        }

    return result