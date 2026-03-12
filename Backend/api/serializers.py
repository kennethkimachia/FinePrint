from rest_framework import serializers
from core_logic.models import Contract, RiskFinding, ContractSummary, RiskCategory


class ContractUploadSerializer(serializers.Serializer):
    file = serializers.FileField(
        help_text="PDF or image of the financial document."
    )
    language = serializers.CharField(
        default="english",
        required=False,
        help_text="Language for the executive summary."
    )

    def validate_file(self, value):
        allowed_types = [
            'application/pdf',
        ]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type: {value.content_type}. "
                f"Allowed: PDF."
            )
        return value


class RiskFindingSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = RiskFinding
        fields = [
            'id',
            'category',
            'original_text',
            'risk_explanation',
            'severity_level',
            'suggested_alternative',
            'page_number',
        ]


class ContractSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractSummary
        fields = ['overall_score', 'executive_summary', 'verdict']


class ContractResultSerializer(serializers.ModelSerializer):
    summary = ContractSummarySerializer(read_only=True)
    risk_findings = RiskFindingSerializer(many=True, read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id',
            'original_filename',
            'status',
            'uploaded_at',
            'processed_at',
            'summary',
            'risk_findings',
        ]
