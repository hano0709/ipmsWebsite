export interface Policy {
    id: number;
    policyNumber: string;
    policyType: 'LIFE' | 'HEALTH' | 'MOTOR' | 'PROPERTY';
    policyStatus: 'DRAFT' | 'ACTIVE' | 'RENEWED' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
    customerCode: string;
    agentCode: string;
    sumInsured: number;
    premiumAmount: number;
    startDate: string;
    endDate: string;
    description: string;
    createdBy: number;
}