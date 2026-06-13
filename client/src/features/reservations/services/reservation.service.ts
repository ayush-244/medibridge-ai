import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Reservation } from "@/features/reservations/types/reservation.types";

export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    const { data } = await api.get<ApiResponse<Reservation[]>>("/reservations");

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch reservations");
    }

    return data.data;
  },

  async getById(id: string): Promise<Reservation> {
    const { data } = await api.get<ApiResponse<Reservation>>(
      `/reservations/${id}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch reservation details");
    }

    return data.data;
  },
};
