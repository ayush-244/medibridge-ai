import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  ChatMessage,
  ChatSession,
  CreateSessionRequest,
  PatientDocument,
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
    const { data } = await api.get<
      ApiResponse<{ session: ChatSession; messages: ChatMessage[] }>
    >(`/copilot/sessions/${id}`);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch session");
    }

    return data.data;
  },

  async createSession(payload: CreateSessionRequest): Promise<ChatSession> {
    const { data } = await api.post<ApiResponse<ChatSession>>(
      "/copilot/sessions",
      payload,
    );

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

  async getDocuments(patientId: string): Promise<PatientDocument[]> {
    const { data } = await api.get<ApiResponse<PatientDocument[]>>(
      `/copilot/documents/${encodeURIComponent(patientId)}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch documents");
    }

    return data.data;
  },
};
