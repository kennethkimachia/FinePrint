from .pdf_processor import extract_text
from .llm_analyzer import analyze_document


def process_document(pdf_file, language="english"):
    """
    Complete pipeline: Extract text from PDF, analyze with LLM, return summary and risks.

    Args:
        pdf_file: Django UploadedFile object
        language (str): Desired language of the summary ('english', 'swahili', 'french', etc.)

    Returns:
        dict: {
            "summary": "...",
            "risks": [
                {"clause": "...", "risk": "..."},
                ...
            ]
        }
    """
    # 1️⃣ Extract text from PDF
    text = extract_text(pdf_file)

    # 2️⃣ Send text to LLM for simplification, risk detection, and summary
    result = analyze_document(text, language)

    return result