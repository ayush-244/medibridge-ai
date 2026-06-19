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
