import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Contract(models.Model):
    """
    The parent object representing an uploaded financial document.
    Stores metadata about the upload and the raw LLM response.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the contract (UUID for API security)."
    )
    file = models.FileField(
        upload_to='contracts/%Y/%m/%d/',
        help_text="The uploaded PDF or image of the financial document."
    )
    original_filename = models.CharField(
        max_length=255,
        blank=True,
        help_text="The original name of the uploaded file."
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        help_text="Current processing status of the contract."
    )
    raw_llm_response = models.JSONField(
        null=True,
        blank=True,
        help_text=(
            "The raw JSON response from the LLM. Stored as a safety measure "
            "so parsing logic can be changed without re-running expensive LLM calls."
        )
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Contract'
        verbose_name_plural = 'Contracts'

    def __str__(self):
        return f"{self.original_filename or 'Unnamed'} ({self.status})"


class RiskCategory(models.Model):
    """
    A lookup table for risk categories (e.g., "Hidden Fees", "Arbitration").
    Managed via Django Admin — no code changes needed to add new types.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="e.g., Hidden Fees, High-Interest Triggers, Late Payment Penalties"
    )
    description = models.TextField(
        blank=True,
        help_text="A brief explanation of what this risk category covers."
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Risk Category'
        verbose_name_plural = 'Risk Categories'

    def __str__(self):
        return self.name


class RiskFinding(models.Model):
    """
    A single "red flag" clause found by the LLM in a contract.
    Each row represents one specific high-risk clause.
    """

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'

    contract = models.ForeignKey(
        Contract,
        on_delete=models.CASCADE,
        related_name='risk_findings',
        help_text="The contract this finding belongs to."
    )
    category = models.ForeignKey(
        RiskCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='findings',
        help_text="The type of risk (e.g., Hidden Fees, Arbitration)."
    )
    original_text = models.TextField(
        help_text="The exact quote from the document — crucial for the highlighting feature."
    )
    risk_explanation = models.TextField(
        help_text="Why the AI considers this clause predatory or risky."
    )
    severity_level = models.CharField(
        max_length=10,
        choices=Severity.choices,
        default=Severity.MEDIUM,
        db_index=True,
        help_text="Drives the 'Bright Red' UI intensity (Low / Medium / High)."
    )
    suggested_alternative = models.TextField(
        blank=True,
        help_text="What a 'fair' version of this clause would look like (optional)."
    )
    page_number = models.IntegerField(
        null=True,
        blank=True,
        help_text="The PDF page number (1-indexed) where this clause appears — used by the frontend to scroll and highlight."
    )

    class Meta:
        ordering = ['-severity_level']
        verbose_name = 'Risk Finding'
        verbose_name_plural = 'Risk Findings'

    def __str__(self):
        label = self.category.name if self.category else 'Uncategorized'
        return f"[{self.severity_level}] {label} — {self.original_text[:60]}"


class ContractSummary(models.Model):
    """
    A high-level overview / TL;DR for an analyzed contract.
    One-to-one relationship with Contract.
    """

    contract = models.OneToOneField(
        Contract,
        on_delete=models.CASCADE,
        related_name='summary',
        help_text="The contract this summary belongs to."
    )
    overall_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Risk rating from 0 (safe) to 100 (extremely risky)."
    )
    executive_summary = models.TextField(
        help_text="A 2-3 sentence TL;DR of the entire document's risk profile."
    )
    verdict = models.TextField(
        blank=True,
        help_text="Actionable recommendation, e.g. 'Do not sign until the Arbitration clause is removed.'"
    )

    class Meta:
        verbose_name = 'Contract Summary'
        verbose_name_plural = 'Contract Summaries'

    def __str__(self):
        return f"Summary for {self.contract} — Score: {self.overall_score}/100"