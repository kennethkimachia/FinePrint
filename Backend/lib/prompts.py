def build_prompt(language="english", industry="general", additional_context=""):
    # Choose appropriate legislation context based on the selected industry
    legislation_context = ""
    if industry == "employment":
        legislation_context = """
Legislation & Regulatory Context (Employment & Labor Laws):
- Evaluate terms against the Fair Labor Standards Act (FLSA) (e.g., illegal unpaid overtime, suspicious wage deductions, misclassification issues).
- Flag restrictive covenants under relevant state and federal constraints, particularly non-compete clauses (which are highly restricted or banned under FTC rules and state laws like California Business & Professions Code Section 16600).
- Check intellectual property assignments for compliance with employee invention protection statutes (e.g., California Labor Code Section 2870, ensuring work done on own time/equipment is protected).
- Identify predatory "Training Repayment Agreement Provisions" (TRAPs) or high exit penalties that penalize departing staff, or unfair "Bad Leaver" buyout rules.
"""
    elif industry == "real_estate":
        legislation_context = """
Legislation & Regulatory Context (Real Estate & Tenant Protection Laws):
- Compare terms against the Uniform Residential Landlord and Tenant Act (URLTA) or local tenant codes.
- Flag direct housing discrimination risks under the Fair Housing Act.
- Identify illegal security deposit provisions (e.g., non-refundable deposits, automatic forfeitures, missing interest rules).
- Watch out for waivers of the landlord's implied warranty of habitability, unconscionable "certified-mail-only" notifications, zero-notice entry rights, or automatic renewals with zero mitigation of damage.
"""
    elif industry == "finance":
        legislation_context = """
Legislation & Regulatory Context (Consumer Finance & Lending Laws):
- Assess clarity of terms under the Truth in Lending Act (TILA) and Consumer Financial Protection Act (CFPA) regarding clear disclosure of finance charges, compound interest, and APR.
- Flag violations of state usury limits (excessive interest rates) and unfair/deceptive/abusive acts or practices (UDAAP).
- Identify penalty APR spikes, hidden service fees, universal defaults (defaulting if you default on an unrelated line of credit), or predatory co-signer lock-ins.
"""
    elif industry == "entertainment":
        legislation_context = """
Legislation & Regulatory Context (Entertainment, Art, & Intellectual Property):
- Analyze transfers under the US Copyright Act, identifying illegal "work made for hire" traps, perpetual transfers without royalties, or restrictions on statutory termination rights (Copyright Act Section 203).
- Assess name, image, and likeness (NIL) rights transfers under state Right of Publicity laws (e.g., California's recent SB-protected digital replicas rules).
- Watch out for unfair recoupment clauses (e.g., tour/marketing cost recoups deducted from artistic royalty splits), re-recording restrictions, or restrictive rights of first refusal.
- Identify predatory clauses granting perpetual, royalty-free rights to train AI generative models or clone styles without compensation.
"""
    elif industry == "automotive":
        legislation_context = """
Legislation & Regulatory Context (Automotive & Transit Contracts):
- Assess disclaimers under standard vehicle leasing codes, peer-to-peer transit regulations, and FTC rules.
- Look out for predatory liability shifting (making renter 100% liable for acts of God, or third-party vehicle damage).
- Flag high arbitrary deductibles, exclusions of passenger medical coverage, or hidden excessive fueling and cleaning fees.
"""
    elif industry == "education":
        legislation_context = """
Legislation & Regulatory Context (Education & Student Lending):
- Review against Higher Education Act regulations and private student loan consumer guidelines.
- Look out for transcript withholding clauses, predatory co-signer release rules, compound interest traps, or early-repayment penalties.
"""
    elif industry == "technology":
        legislation_context = """
Legislation & Regulatory Context (Technology, SaaS, & Privacy Laws):
- Review terms for compliance with FTC Section 5 regarding deceptive or unfair practices.
- Assess data usage under CCPA/GDPR (e.g., unilateral selling of personal data or training AI models on customer data without consent).
- Identify unilateral revision terms (changing prices or privacy terms without notice), forced arbitration clauses, and total disclaimers of merchantability or fitness.
"""
    else:
        legislation_context = """
Legislation & Regulatory Context (General Contracts & Consumer Protection):
- Assess terms using general principles of contract unconscionability, unconscionable liability limits, and constraints under the Federal Arbitration Act (FAA) regarding forced arbitration and class-action waivers.
- Watch for hidden auto-renewal clauses, extreme one-sided termination terms, or excessive liquidated damages.
"""

    custom_context_str = ""
    if additional_context:
        custom_context_str = f"""
Additional User-Provided Focus Areas / Context:
The user has specified the following additional details or target concerns for this contract:
"{additional_context}"
Please pay special attention to this context, analyzing the document with high sensitivity to these specific concerns!
"""

    return f"""You are an expert legal contract analyst specializing in consumer financial protection and contract risk assessment.

Analyze the uploaded document (e.g., student loan, employment contract, lease agreement, artist deal, terms of service) in light of the industry legislation and context provided below, and identify ALL high-risk clauses that could harm the consumer, employee, creator, or tenant.

Selected Industry: {industry.upper()}

{legislation_context}
{custom_context_str}

Focus on these risk categories:
- Hidden Fees: unexpected charges, annual fees, dormant account fees, early termination fees
- High-Interest & Defaults: Penalty APR after 60 days, universal defaults, loss of promo rates, default based on "belief"
- Auto-Renewal: automatic contract renewal, 48-hour renewal windows, payment escalation without consent
- Arbitration & Waivers: Forced arbitration, class-action waivers, negligence waivers
- IP & Ownership Traps: "Work made for hire", perpetual transfers, 24/7 employer IP trap, AI training/scraping licenses, name/likeness rights, re-recording restrictions, marketing recoupment
- Extreme Liability Shifts: 100% liability shift to owner, full liability for under-25 drivers, no passenger medical coverage, $750 deductibles
- Restrictive Covenants & Exit Traps: 2-year global non-competes, "Bad Leaver" traps, book value buybacks, no acceleration on sale
- Unfair Termination & Cancellation: 90-day cancellation notices, certified mail only, full year's rent due immediately, no duty to mitigate
- Vague or Unilateral Rights: Zero-notice landlord entry, unlimited revision rounds, voiding of verbal staff promises, no liability for AI-cloned styles, vague "necessary" overtime

Return your analysis as JSON with this exact structure:
{{
    "executive_summary": "A 2-3 sentence TL;DR of the document's overall risk profile in {language}, written in clear, accessible plain language, referencing how selected legislation or industry standards affect this document's terms.",
    "overall_risk_score": <integer from 0 (safe) to 100 (extremely risky)>,
    "verdict": "A single actionable recommendation for the consumer, e.g. 'Do not sign until the forced arbitration clause is removed.' or 'This contract is relatively fair but watch for the late payment penalty on page 4.'",
    "risk_findings": [
        {{
            "category": "<one of: Hidden Fees, High-Interest & Defaults, Auto-Renewal, Arbitration & Waivers, IP & Ownership Traps, Extreme Liability Shifts, Restrictive Covenants & Exit Traps, Unfair Termination & Cancellation, Vague or Unilateral Rights>",
            "original_text": "<exact quote from the document>",
            "risk_explanation": "<plain-language explanation of why this is risky, referencing specific legislation or regulatory guidelines when applicable>",
            "severity_level": "<one of: LOW, MEDIUM, HIGH>",
            "suggested_alternative": "<what a fair version of this clause would look like>",
            "page_number": <integer — the PDF page number (1-indexed) where this clause appears>
        }}
    ]
}}

Rules:
- original_text MUST be the exact wording from the document, not a paraphrase
- page_number MUST be the actual page in the PDF where the clause is found (1-indexed)
- verdict should be specific and actionable, referencing the most critical finding by name
- Provide at least one finding per category if applicable
- If the document has no risks for a category, omit that category
- executive_summary should be in {language}
- Return ONLY valid JSON, no markdown or extra text
"""