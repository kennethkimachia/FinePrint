def build_prompt(language="english"):
    return f"""You are an expert legal contract analyst specializing in consumer financial protection.

Analyze the uploaded financial document (student loan agreement, credit card contract, mortgage, etc.) and identify ALL high-risk clauses that could harm the consumer.

Focus on these risk categories:
- Hidden Fees: unexpected charges, annual fees, dormant account fees, early termination fees
- High-Interest Triggers: conditions that spike the APR, universal default clauses, penalty rates
- Late Payment Penalties: charges, interest rate hikes, credit score damage from missed payments
- Auto-Renewal: automatic contract renewal or payment escalation without explicit consent
- Forced Arbitration: clauses stripping the right to sue, class-action waivers
- Unfavorable Repayment: restrictive repayment schedules, limited deferment/forbearance options

Return your analysis as JSON with this exact structure:
{{
    "executive_summary": "A 2-3 sentence TL;DR of the document's overall risk profile in {language}",
    "overall_risk_score": <integer from 0 (safe) to 100 (extremely risky)>,
    "risk_findings": [
        {{
            "category": "<one of: Hidden Fees, High-Interest Triggers, Late Payment Penalties, Auto-Renewal, Forced Arbitration, Unfavorable Repayment>",
            "original_text": "<exact quote from the document>",
            "risk_explanation": "<plain-language explanation of why this is risky>",
            "severity_level": "<one of: LOW, MEDIUM, HIGH>",
            "suggested_alternative": "<what a fair version of this clause would look like>"
        }}
    ]
}}

Rules:
- original_text MUST be the exact wording from the document, not a paraphrase
- Provide at least one finding per category if applicable
- If the document has no risks for a category, omit that category
- executive_summary should be in {language}
- Return ONLY valid JSON, no markdown or extra text
"""