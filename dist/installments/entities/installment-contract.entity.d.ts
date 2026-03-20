import { InstallmentCustomer } from './installment-customer.entity';
import { InstallmentPayment } from './installment-payment.entity';
export declare class InstallmentContract {
    id: number;
    contractNumber: string;
    customer: InstallmentCustomer;
    productName: string;
    productDescription: string;
    totalPrice: number;
    downPayment: number;
    remainingAmount: number;
    installmentAmount: number;
    installmentCount: number;
    paidCount: number;
    startDate: string;
    nextDueDate: string;
    frequency: string;
    status: string;
    guarantorName: string;
    guarantorPhone: string;
    notes: string;
    createdAt: Date;
    payments: InstallmentPayment[];
}
