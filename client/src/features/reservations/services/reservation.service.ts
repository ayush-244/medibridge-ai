import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import type { ReservationDuration } from "@/lib/constants";

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

  async markArrived(id: string): Promise<Reservation> {
    const { data } = await api.patch<ApiResponse<Reservation>>(
      `/reservations/${id}/arrive`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to mark patient as arrived");
    }

    return data.data;
  },

  async extend(id: string, durationHours: ReservationDuration): Promise<Reservation> {
    const { data } = await api.patch<ApiResponse<Reservation>>(
      `/reservations/${id}/extend`,
      { durationHours },
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to extend reservation");
    }

    return data.data;
  },

  async cancel(id: string): Promise<Reservation> {
    const { data } = await api.patch<ApiResponse<Reservation>>(
      `/reservations/${id}/cancel`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to cancel reservation");
    }

    return data.data;
  },

  async complete(id: string): Promise<Reservation> {
    const { data } = await api.patch<ApiResponse<Reservation>>(
      `/reservations/${id}/complete`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to complete reservation");
    }

    return data.data;
  },
};
