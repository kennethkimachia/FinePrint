from rest_framework import serializers


class ContractUploadSerializer(serializers.Serializer):
    file = serializers.FileField(
        help_text="PDF or image of the financial document."
    )
    language = serializers.CharField(
        default="english",
        required=False,
        help_text="Language for the executive summary."
    )
    industry = serializers.CharField(
        default="general",
        required=False,
        help_text="Industry category for contextual legal analysis."
    )
    additional_context = serializers.CharField(
        default="",
        required=False,
        allow_blank=True,
        help_text="Any additional context or specific concerns."
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
