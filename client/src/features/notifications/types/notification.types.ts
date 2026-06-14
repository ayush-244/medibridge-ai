export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationCreatedPayload {
  title: string;
  message: string;
  type: NotificationType;
}
