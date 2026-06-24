export interface CopilotCitation {
  fileName: string;
  chunkIndex: number;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  summary?: string;
  evidence?: string[];
  confidence?: number;
  citations?: CopilotCitation[];
  suggestedQuestions?: string[];
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  patientId: string;
  referralId?: string;
  userId: string;
  title: string;
  patientName?: string;
  condition?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDocument {
  fileName: string;
  uploadDate: string;
  chunkCount: number;
  patientId: string;
}

export interface CreateSessionRequest {
  patientId: string;
  referralId?: string;
  patientName?: string;
  condition?: string;
  title?: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  session: ChatSession;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type UrgencyLevel = "Routine" | "Urgent" | "Emergency" | "Critical";

export type TransferRecommendation =
  | "Immediate Transfer"
  | "Transfer within 2 hours"
  | "Transfer within 24 hours"
  | "No transfer required";

export interface PatientSnapshot {
  primaryDiagnosis: string;
  riskLevel: RiskLevel;
  medications: string[];
  recommendedSpecialist: string;
  urgency: string;
  transferRecommendation: string;
  confidence: number;
  aiFindings: string[];
  evidence: string[];
  citations?: CopilotCitation[];
}

export interface ClinicalIntelligence extends PatientSnapshot {}

export interface CopilotAnalyticsSummary {
  totalSessions: number;
  totalQuestions: number;
  mostCommonDiagnoses: { diagnosis: string; count: number }[];
  mostRecommendedSpecialists: { specialist: string; count: number }[];
  averageConfidence: number;
  referralConversions: number;
}

export interface PatientContext {
  patientName: string;
  age?: number;
  gender?: string;
  diagnosis: string;
  riskLevel: RiskLevel;
  hospital?: string;
  referralStatus?: string;
  referralId?: string;
  urgency?: string;
  transferRecommendation?: string;
  recommendedSpecialist?: string;
  medications?: string[];
  aiConfidence?: number;
  aiFindings?: string[];
  sourceHospital?: string;
  destinationHospital?: string;
}

export interface CopilotReferralContext {
  referralId: string;
  patientName: string;
  age: number;
  gender?: string;
  diagnosis: string;
  condition: string;
  sourceHospital: string;
  destinationHospital: string;
  priority: string;
  status: string;
  documents: { fileName: string; uploadDate: string }[];
}

export interface CopilotDocumentAnalysis {
  patientName?: string;
  age?: number;
  diagnosis?: string;
  medications?: string[];
  riskFactors?: string[];
  extractedFrom: string[];
}

export type CopilotMode = "referral" | "document";

export interface CopilotDocumentsResponse {
  documents: PatientDocument[];
  total: number;
  hasMore: boolean;
}

export interface ReferralAutofillData {
  patientName: string;
  age: number;
  gender: string;
  diagnosis: string;
  medications: string[];
  riskFactors: string[];
}
