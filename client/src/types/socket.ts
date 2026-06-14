export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: "notificationCreated",
  REFERRAL_ACCEPTED: "referralAccepted",
  BED_RESERVED: "bedReserved",
  RESERVATION_EXPIRED: "reservationExpired",
  DOCTOR_ASSIGNED: "doctorAssigned",
  DASHBOARD_UPDATED: "dashboardUpdated",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export type ConnectionStatus = "connected" | "reconnecting" | "offline";

export interface NotificationCreatedPayload {
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
}

export interface ReferralAcceptedPayload {
  referralId: string;
  patientName: string;
}

export interface BedReservedPayload {
  reservationId: string;
  patientName: string;
}

export interface ReservationExpiredPayload {
  reservationId: string;
  patientName: string;
}

export interface DoctorAssignedPayload {
  doctorId: string;
  doctorName: string;
}

export interface DashboardUpdatedPayload {
  action: string;
}

export interface SocketEventPayloadMap {
  [SOCKET_EVENTS.NOTIFICATION_CREATED]: NotificationCreatedPayload;
  [SOCKET_EVENTS.REFERRAL_ACCEPTED]: ReferralAcceptedPayload;
  [SOCKET_EVENTS.BED_RESERVED]: BedReservedPayload;
  [SOCKET_EVENTS.RESERVATION_EXPIRED]: ReservationExpiredPayload;
  [SOCKET_EVENTS.DOCTOR_ASSIGNED]: DoctorAssignedPayload;
  [SOCKET_EVENTS.DASHBOARD_UPDATED]: DashboardUpdatedPayload;
}

export interface SocketLastEvent {
  event: SocketEventName;
  data: SocketEventPayloadMap[SocketEventName];
  timestamp: number;
}
