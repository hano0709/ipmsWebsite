export interface PolicyAudit {
    id: number;
    policyNumber: string;
    previousStatus: string;
    newStatus: string;
    changedBy: number;
    remarks: string;
    createdBy: number;
}