import os
import uuid
import tempfile
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from core_logic.llm_analyzer import analyze_document
from api.serializers import ContractUploadSerializer


@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_contract(request):
    tmp_path = None
    try:
        # Verify API key if configured and the request is external
        expected_secret_key = os.getenv("API_SECRET_KEY")
        if expected_secret_key:
            origin = request.META.get('HTTP_ORIGIN') or ''
            referer = request.META.get('HTTP_REFERER') or ''
            host = request.get_host()
            
            is_same_origin = (
                (origin and host in origin) or 
                (referer and host in referer) or 
                'localhost' in origin or '127.0.0.1' in origin or '[::1]' in origin or
                'localhost' in referer or '127.0.0.1' in referer or '[::1]' in referer
            )
            
            if not is_same_origin:
                provided_key = request.headers.get("X-Api-Key") or request.META.get("HTTP_X_API_KEY")
                if not provided_key or provided_key != expected_secret_key:
                    return Response(
                        {"error": "Unauthorized: Invalid or missing API Secret Key."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

        serializer = ContractUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data['file']
        language = serializer.validated_data.get('language', 'english')
        industry = serializer.validated_data.get('industry', 'general')
        additional_context = serializer.validated_data.get('additional_context', '')

        # Write uploaded file to a temp file (use /tmp on Vercel/Linux if it exists, fallback to default temp dir)
        suffix = os.path.splitext(uploaded_file.name)[1] or '.pdf'
        tmp_dir = '/tmp' if os.path.exists('/tmp') else None
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=tmp_dir)
        try:
            for chunk in uploaded_file.chunks():
                tmp_file.write(chunk)
            tmp_file.close()
            tmp_path = tmp_file.name
        except Exception:
            tmp_file.close()
            if tmp_file.name and os.path.exists(tmp_file.name):
                os.unlink(tmp_file.name)
            raise

        result = analyze_document(tmp_path, language, industry, additional_context)

        # Delete the temp file immediately after analysis
        os.unlink(tmp_path)
        tmp_path = None

        now = datetime.now(timezone.utc).isoformat()

        # Build response in the same shape the frontend expects
        findings = []
        for i, finding in enumerate(result.get('risk_findings', []), start=1):
            findings.append({
                'id': i,
                'category': finding.get('category', 'Uncategorized'),
                'original_text': finding.get('original_text', ''),
                'risk_explanation': finding.get('risk_explanation', ''),
                'severity_level': finding.get('severity_level', 'MEDIUM'),
                'suggested_alternative': finding.get('suggested_alternative', ''),
                'page_number': finding.get('page_number'),
            })

        response_data = {
            'id': str(uuid.uuid4()),
            'original_filename': uploaded_file.name,
            'status': 'COMPLETED',
            'uploaded_at': now,
            'processed_at': now,
            'summary': {
                'overall_score': result.get('overall_risk_score', 0),
                'executive_summary': result.get('executive_summary', ''),
                'verdict': result.get('verdict', ''),
            },
            'risk_findings': findings,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Clean up temp file if it still exists
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        return Response(
            {'error': f'Analysis failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
