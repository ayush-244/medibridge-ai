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
  HOSPITAL_REGISTERED: "hospitalRegistered",
  HOSPITAL_APPROVED: "hospitalApproved",
  HOSPITAL_REJECTED: "hospitalRejected",
  HOSPITAL_ADMIN_APPROVED: "hospitalAdminApproved",
  HOSPITAL_ADMIN_REJECTED: "hospitalAdminRejected",
  DOCTOR_REGISTERED: "doctorRegistered",
  DOCTOR_APPROVED: "doctorApproved",
  DOCTOR_REJECTED: "doctorRejected",
  PASSWORD_CHANGED: "passwordChanged",
  COPILOT_SESSION_STARTED: "copilotSessionStarted",
  COPILOT_QUESTION_ASKED: "copilotQuestionAsked",
  COPILOT_RESPONSE_GENERATED: "copilotResponseGenerated",
  PATIENT_SNAPSHOT_GENERATED: "patientSnapshotGenerated",
  RISK_ANALYSIS_GENERATED: "riskAnalysisGenerated",
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
  userId?: string;
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

export interface CopilotEventPayload {
  sessionId?: string;
  patientId: string;
  patientName?: string;
  question?: string;
  confidence?: number;
  userId?: string;
  diagnosis?: string;
  riskLevel?: string;
  urgency?: string;
  specialist?: string;
}

export interface HospitalRegisteredPayload {
  hospitalId: string;
  hospitalName: string;
  adminUserId: string;
}

export interface HospitalApprovalPayload {
  hospitalId: string;
  hospitalName: string;
  adminUserId: string;
}

export interface HospitalAdminEventPayload {
  userId: string;
  name: string;
  hospitalId: string;
}

export interface DoctorRegisteredPayload {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  userId: string;
}

export interface DoctorApprovalPayload {
  doctorId: string;
  doctorName: string;
  userId?: string;
}

export interface PasswordChangedPayload {
  userId: string;
  name: string;
  firstLogin: boolean;
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
  [SOCKET_EVENTS.HOSPITAL_REGISTERED]: HospitalRegisteredPayload;
  [SOCKET_EVENTS.HOSPITAL_APPROVED]: HospitalApprovalPayload;
  [SOCKET_EVENTS.HOSPITAL_REJECTED]: HospitalApprovalPayload;
  [SOCKET_EVENTS.HOSPITAL_ADMIN_APPROVED]: HospitalAdminEventPayload;
  [SOCKET_EVENTS.HOSPITAL_ADMIN_REJECTED]: HospitalAdminEventPayload;
  [SOCKET_EVENTS.DOCTOR_REGISTERED]: DoctorRegisteredPayload;
  [SOCKET_EVENTS.DOCTOR_APPROVED]: DoctorApprovalPayload;
  [SOCKET_EVENTS.DOCTOR_REJECTED]: DoctorApprovalPayload;
  [SOCKET_EVENTS.PASSWORD_CHANGED]: PasswordChangedPayload;
  [SOCKET_EVENTS.COPILOT_SESSION_STARTED]: CopilotEventPayload;
  [SOCKET_EVENTS.COPILOT_QUESTION_ASKED]: CopilotEventPayload;
  [SOCKET_EVENTS.COPILOT_RESPONSE_GENERATED]: CopilotEventPayload;
  [SOCKET_EVENTS.PATIENT_SNAPSHOT_GENERATED]: CopilotEventPayload;
  [SOCKET_EVENTS.RISK_ANALYSIS_GENERATED]: CopilotEventPayload;
}

export interface SocketLastEvent {
  event: SocketEventName;
  data: SocketEventPayloadMap[SocketEventName];
  timestamp: number;
}
