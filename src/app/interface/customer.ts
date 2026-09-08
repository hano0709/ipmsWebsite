import { User } from "./user";

export interface Customer {
    id: number;
    customerCode: string;
    user: User;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: string;
    kycStatus: string;
}