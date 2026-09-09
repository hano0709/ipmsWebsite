import { User } from "./user";

export interface Agent {
    id: number;
    agentCode: string;
    user: User;
    fullName: string;
    licenseNumber: string;
    isActive: boolean;
    createdBy: number;
}