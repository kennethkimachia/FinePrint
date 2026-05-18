export interface RiskFinding {
  id: number;
  category: string;
  original_text: string;
  risk_explanation: string;
  severity_level: 'LOW' | 'MEDIUM' | 'HIGH';
  suggested_alternative: string;
  page_number: number;
}

export interface ContractSummary {
  overall_score: number;
  executive_summary: string;
  verdict: string;
}

export interface ContractAnalysis {
  id: string;
  original_filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploaded_at: string;
  processed_at: string;
  summary: ContractSummary;
  risk_findings: RiskFinding[];
}

const API_BASE_URL = '/api/contracts';

export const uploadContract = async (
  file: File,
  industry: string = 'general',
  additionalContext: string = ''
): Promise<ContractAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('industry', industry);
  formData.append('additional_context', additionalContext);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (response.status === 401) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Unauthorized: API access is strictly restricted.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || 'Failed to upload contract');
  }

  return response.json();
};

