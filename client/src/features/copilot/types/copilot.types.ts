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
  patientId: string;
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
}

export const QUICK_STARTERS = [
  { label: "Summarize Patient", question: "Summarize this patient's medical records." },
  { label: "Show Diagnosis", question: "What is the primary diagnosis?" },
  { label: "Show Medications", question: "What medications is the patient taking?" },
  { label: "Show Risk Factors", question: "What risk factors are documented?" },
  { label: "Recommend Specialist", question: "Which specialist is recommended?" },
  { label: "Follow-Up Care", question: "What follow-up care is required?" },
] as const;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "What is the diagnosis?",
  "What medications is the patient taking?",
  "What risk factors are documented?",
  "Which specialist is recommended?",
  "What follow-up care is required?",
  "Why was the patient referred?",
  "What abnormalities were detected?",
];
