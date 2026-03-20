import { InstallmentContract } from './installment-contract.entity';
export declare class InstallmentCustomer {
    id: number;
    name: string;
    phone: string;
    phone2: string;
    address: string;
    nationalId: string;
    notes: string;
    status: string;
    createdAt: Date;
    contracts: InstallmentContract[];
}
