export interface PolicyAudit {
  id: number;
  policyNumber: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  changedBy: number | null;
  createdBy: number;
  changedAt: string;   
  createdAt: string; 
}