export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: "notificationCreated",
  REFERRAL_ACCEPTED: "referralAccepted",
  BED_RESERVED: "bedReserved",
  RESERVATION_EXPIRED: "reservationExpired",
  DOCTOR_ASSIGNED: "doctorAssigned",
  DASHBOARD_UPDATED: "dashboardUpdated",
  USER_CREATED: "userCreated",
  USER_UPDATED: "userUpdated",
  DOCTOR_CREATED: "doctorCreated",
  DOCTOR_UPDATED: "doctorUpdated",
  HOSPITAL_UPDATED: "hospitalUpdated",
  RESERVATION_EXTENDED: "reservationExtended",
  RESERVATION_CANCELLED: "reservationCancelled",
  PATIENT_ARRIVED: "patientArrived",
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

export interface UserEventPayload {
  userId: string;
  name: string;
  role?: string;
  action?: string;
}

export interface DoctorEventPayload {
  doctorId: string;
  doctorName: string;
}

export interface HospitalEventPayload {
  hospitalId: string;
  name: string;
  action?: string;
}

export interface ReservationActionPayload {
  reservationId: string;
  patientName: string;
  durationHours?: number;
}

export interface SocketEventPayloadMap {
  [SOCKET_EVENTS.NOTIFICATION_CREATED]: NotificationCreatedPayload;
  [SOCKET_EVENTS.REFERRAL_ACCEPTED]: ReferralAcceptedPayload;
  [SOCKET_EVENTS.BED_RESERVED]: BedReservedPayload;
  [SOCKET_EVENTS.RESERVATION_EXPIRED]: ReservationExpiredPayload;
  [SOCKET_EVENTS.DOCTOR_ASSIGNED]: DoctorAssignedPayload;
  [SOCKET_EVENTS.DASHBOARD_UPDATED]: DashboardUpdatedPayload;
  [SOCKET_EVENTS.USER_CREATED]: UserEventPayload;
  [SOCKET_EVENTS.USER_UPDATED]: UserEventPayload;
  [SOCKET_EVENTS.DOCTOR_CREATED]: DoctorEventPayload;
  [SOCKET_EVENTS.DOCTOR_UPDATED]: DoctorEventPayload;
  [SOCKET_EVENTS.HOSPITAL_UPDATED]: HospitalEventPayload;
  [SOCKET_EVENTS.RESERVATION_EXTENDED]: ReservationActionPayload;
  [SOCKET_EVENTS.RESERVATION_CANCELLED]: ReservationActionPayload;
  [SOCKET_EVENTS.PATIENT_ARRIVED]: ReservationActionPayload;
}

export interface SocketLastEvent {
  event: SocketEventName;
  data: SocketEventPayloadMap[SocketEventName];
  timestamp: number;
}
