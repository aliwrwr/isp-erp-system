import { InstallmentContract } from './installment-contract.entity';
export declare class InstallmentPayment {
    id: number;
    contract: InstallmentContract;
    amount: number;
    date: string;
    notes: string;
    status: string;
    receivedBy: string;
    createdAt: Date;
}
