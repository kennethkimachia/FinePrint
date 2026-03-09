# pdf_processor.py
import fitz  # PyMuPDF

def extract_text(pdf_file):
    """
    Extract text from a PDF file.
    pdf_file: either a file path (str) or a file-like object with .read()
    """
    if isinstance(pdf_file, str):
        doc = fitz.open(pdf_file)
    else:
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text()

    return text