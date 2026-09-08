export interface PolicyAuditLogDTO {
  id: number;
  policyNumber: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  changedBy: number | null;
  createdBy: number;
}
