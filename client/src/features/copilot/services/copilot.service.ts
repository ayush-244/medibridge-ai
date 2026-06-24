import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  ChatMessage,
  ChatSession,
  ClinicalIntelligence,
  CopilotAnalyticsSummary,
  CopilotDocumentsResponse,
  CreateSessionRequest,
  PatientSnapshot,
  SendMessageResponse,
} from "@/features/copilot/types/copilot.types";

export const copilotService = {
  async getSessions(): Promise<ChatSession[]> {
    const { data } = await api.get<ApiResponse<ChatSession[]>>("/copilot/sessions");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch sessions");
    }
    return data.data;
  },

  async getSession(id: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    const { data } = await api.get<ApiResponse<{ session: ChatSession; messages: ChatMessage[] }>>(
      `/copilot/sessions/${id}`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch session");
    }
    return data.data;
  },

  async createSession(payload: CreateSessionRequest): Promise<ChatSession> {
    const { data } = await api.post<ApiResponse<ChatSession>>("/copilot/sessions", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create session");
    }
    return data.data;
  },

  async sendMessage(sessionId: string, question: string): Promise<SendMessageResponse> {
    const { data } = await api.post<ApiResponse<SendMessageResponse>>(
      `/copilot/sessions/${sessionId}/messages`,
      { question },
      { timeout: 120000 },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to send message");
    }
    return data.data;
  },

  async getDocuments(
    patientId: string,
    cursor?: number,
    limit = 20,
  ): Promise<CopilotDocumentsResponse> {
    const params = new URLSearchParams();
    if (cursor !== undefined) params.set("cursor", String(cursor));
    params.set("limit", String(limit));
    const { data } = await api.get<ApiResponse<CopilotDocumentsResponse>>(
      `/copilot/documents/${encodeURIComponent(patientId)}?${params.toString()}`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch documents");
    }
    return data.data;
  },

  async getPatientSnapshot(patientId: string): Promise<PatientSnapshot> {
    const { data } = await api.get<ApiResponse<PatientSnapshot>>(
      `/copilot/snapshot/${encodeURIComponent(patientId)}`,
      { timeout: 120000 },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to generate patient snapshot");
    }
    return data.data;
  },

  async getClinicalIntelligence(patientId: string): Promise<ClinicalIntelligence> {
    const { data } = await api.get<ApiResponse<ClinicalIntelligence>>(
      `/copilot/intelligence/${encodeURIComponent(patientId)}`,
      { timeout: 120000 },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to generate clinical intelligence");
    }
    return data.data;
  },

  async getAnalytics(): Promise<CopilotAnalyticsSummary> {
    const { data } = await api.get<ApiResponse<CopilotAnalyticsSummary>>("/copilot/analytics");
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch analytics");
    }
    return data.data;
  },

  async uploadDocument(patientId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    const { data } = await api.post<ApiResponse<void>>("/copilot/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    if (!data.success) {
      throw new Error(data.message || "Failed to upload document");
    }
  },
};
