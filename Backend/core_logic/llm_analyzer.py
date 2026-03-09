# core_logic/llm_analyzer.py

import os
import openai
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables!")

openai.api_key = OPENAI_API_KEY


def analyze_document(text, language="english"):
    """
    Sends the document text to OpenAI LLM for:
    1. Simplifying legal language
    2. Highlighting high-risk clauses
    3. Summarizing main points
    4. Optionally translating summary

    Returns:
        dict: {"summary": "...", "risks": [{"clause": "...", "risk": "..."}, ...]}
    """
    prompt = f"""
You are a legal contract assistant.

Tasks:
1. Simplify this contract text in plain language.
2. Highlight high-risk clauses (hidden fees, late penalties, auto-renewals, forced arbitration, unusual interest triggers).
3. Summarize the main points.
4. Return output in JSON with keys:
   {{
       "summary": "...",
       "risks": [
           {{"clause": "...", "risk": "..."}},
           ...
       ]
   }}
5. Translate the summary to {language} if needed.

Contract text:
{text}
"""

    # Call OpenAI's chat API
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=3000
        )
        content = response.choices[0].message.content

        # Attempt to parse JSON
        result = json.loads(content)
    except Exception as e:
        # Fallback if LLM fails or returns invalid JSON
        result = {
            "summary": f"Failed to analyze document: {str(e)}",
            "risks": []
        }

    return result