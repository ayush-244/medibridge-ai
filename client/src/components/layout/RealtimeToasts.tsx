import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

export function RealtimeToasts() {
  useSocketEvent(SOCKET_EVENTS.NOTIFICATION_CREATED, (payload) => {
    showInfoToast(`${payload.title}: ${payload.message}`);
  });

  useSocketEvent(SOCKET_EVENTS.REFERRAL_ACCEPTED, (payload) => {
    showSuccessToast(
      `Referral Accepted${payload.patientName ? `: ${payload.patientName}` : ""}`,
    );
  });

  useSocketEvent(SOCKET_EVENTS.DOCTOR_ASSIGNED, (payload) => {
    showSuccessToast(
      `Doctor Assigned${payload.doctorName ? `: ${payload.doctorName}` : ""}`,
    );
  });

  useSocketEvent(SOCKET_EVENTS.BED_RESERVED, (payload) => {
    showSuccessToast(
      `Bed Reserved${payload.patientName ? `: ${payload.patientName}` : ""}`,
    );
  });

  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXPIRED, (payload) => {
    showWarningToast(
      `Reservation Expired${payload.patientName ? `: ${payload.patientName}` : ""}`,
    );
  });

  return null;
}
