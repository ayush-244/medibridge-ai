export interface ActivityLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  performedBy: string;
  createdAt: string;
  updatedAt?: string;
}
