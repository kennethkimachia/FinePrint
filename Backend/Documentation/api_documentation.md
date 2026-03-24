# FinePrint API Documentation

This document outlines the API endpoints, request/response formats, and UI guidance for the frontend developer building the FinePrint web application.

## Overview

The FinePrint backend parses financial documents (PDF/images) using gemini-3-flash-preview to identify predatory clauses ("Scary Stuff"). The frontend should provide a UI with a PDF viewer on the left, and a "Risk Cards" panel on the right.

### Base URL

`http://localhost:8000/api/contracts/`

---

## 1. Upload & Analyze Document

Uploads a document for analysis. The backend sends the file to Gemini, generates the risk findings, and returns the full analysis.

- **Endpoint:** `POST upload/`
- **Content-Type:** `multipart/form-data`

### Request Body

| Field      | Type     | Required | Description                                                                                                          |
| ---------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `file`     | `File`   | Yes      | The financial contract file. Allowed types: `application/pdf`, `image/png`, `image/jpeg`, `image/gif`, `image/webp`. |
| `language` | `String` | No       | Language for the risk summary (default: `english`).                                                                  |

### Response (201 Created)

```json
{
  "id": "e0e318df-35a1-432a-bc96-1c881c1db0f1",
  "original_filename": "student_loan_agreement.pdf",
  "status": "COMPLETED",
  "uploaded_at": "2026-03-12T09:00:00Z",
  "processed_at": "2026-03-12T09:00:15Z",
  "summary": {
    "overall_score": 85,
    "executive_summary": "This contract contains several high-risk clauses including forced arbitration.",
    "verdict": "Do not sign until the Arbitration clause is removed."
  },
  "risk_findings": [
    {
      "id": 1,
      "category": "Forced Arbitration",
      "original_text": "By signing this agreement, you waive your right to a trial by jury...",
      "risk_explanation": "You cannot sue the lender in a real court if they break the law.",
      "severity_level": "HIGH",
      "suggested_alternative": "Both parties retain the right to resolve disputes in small claims court.",
      "page_number": 4
    }
  ]
}
```

---

## 2. Retrieve Contract Analysis

Fetches the results of a previously processed contract.

- **Endpoint:** `GET <uuid:contract_id>/results/`
- **Content-Type:** `application/json`

### Response (200 OK)

Returns the exact same JSON schema as the `POST upload/` endpoint.

---

## Frontend Integration Guide

### PDF Scrolling (Risk Cards UI)

When the user clicks a "Risk Card" on the right sidebar, the frontend should:

1. Trigger a scroll event on the PDF viewer using the `page_number` field from the chosen `risk_findings` item. (Note: `page_number` is 1-indexed).
2. Use the `original_text` field to perform a text-search on the PDF page and apply a **Bright Red** highlight over the text bounds.

### Visual Summary & Verdict

The `summary` object contains high-level data for the top of the UI:

- **`overall_score` (0-100):** Use this to power a circular progress bar or gauge chart (e.g., Green for < 30, Yellow for 30-70, Red for > 70).
- **`verdict`:** A single, actionable sentence (e.g., "Do not sign until..."). This should be displayed prominently near the score.
- **`severity_level`:** Risk findings include `LOW`, `MEDIUM`, or `HIGH`. Use these to color code the individual Risk Cards (e.g., Yellow, Orange, Red).
