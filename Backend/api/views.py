from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from core_logic.models import Contract, RiskFinding, ContractSummary, RiskCategory
from core_logic.llm_analyzer import analyze_document
from api.serializers import ContractUploadSerializer, ContractResultSerializer


@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_contract(request):
    serializer = ContractUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uploaded_file = serializer.validated_data['file']
    language = serializer.validated_data.get('language', 'english')

    contract = Contract.objects.create(
        file=uploaded_file,
        original_filename=uploaded_file.name,
        status=Contract.Status.PROCESSING,
    )

    try:
        result = analyze_document(contract.file.path, language)

        contract.raw_llm_response = result
        contract.status = Contract.Status.COMPLETED
        contract.processed_at = timezone.now()
        contract.save()

        ContractSummary.objects.create(
            contract=contract,
            overall_score=result.get('overall_risk_score', 0),
            executive_summary=result.get('executive_summary', ''),
        )

        for finding in result.get('risk_findings', []):
            category_obj = None
            category_name = finding.get('category')
            if category_name:
                category_obj, _ = RiskCategory.objects.get_or_create(
                    name=category_name,
                    defaults={'description': ''}
                )

            RiskFinding.objects.create(
                contract=contract,
                category=category_obj,
                original_text=finding.get('original_text', ''),
                risk_explanation=finding.get('risk_explanation', ''),
                severity_level=finding.get('severity_level', 'MEDIUM'),
                suggested_alternative=finding.get('suggested_alternative', ''),
            )

        response_serializer = ContractResultSerializer(contract)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        contract.status = Contract.Status.FAILED
        contract.save()
        return Response(
            {'error': f'Analysis failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
def get_contract_results(request, contract_id):
    try:
        contract = Contract.objects.get(id=contract_id)
    except Contract.DoesNotExist:
        return Response(
            {'error': 'Contract not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ContractResultSerializer(contract)
    return Response(serializer.data)
