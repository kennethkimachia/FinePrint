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

export const uploadContract = async (file: File): Promise<ContractAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload contract');
  }

  return response.json();
};

export const getContractResults = async (id: string): Promise<ContractAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/${id}/results/`);

  if (!response.ok) {
    throw new Error('Failed to fetch contract results');
  }

  return response.json();
};
