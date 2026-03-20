import { InstallmentsService } from './installments.service';
export declare class InstallmentsController {
    private readonly svc;
    constructor(svc: InstallmentsService);
    dashboard(): Promise<{
        totalCustomers: number;
        totalContracts: number;
        activeContracts: number;
        lateContracts: number;
        totalCollected: number;
        totalRemaining: number;
        overdueContracts: number;
        recentContracts: import("./entities/installment-contract.entity").InstallmentContract[];
    }>;
    findCustomers(s?: string): Promise<import("./entities/installment-customer.entity").InstallmentCustomer[]>;
    findOneCustomer(id: string): Promise<import("./entities/installment-customer.entity").InstallmentCustomer>;
    createCustomer(dto: any): Promise<import("./entities/installment-customer.entity").InstallmentCustomer>;
    updateCustomer(id: string, dto: any): Promise<import("./entities/installment-customer.entity").InstallmentCustomer>;
    removeCustomer(id: string): Promise<void>;
    findContracts(s?: string, q?: string): Promise<import("./entities/installment-contract.entity").InstallmentContract[]>;
    findOneContract(id: string): Promise<import("./entities/installment-contract.entity").InstallmentContract>;
    createContract(dto: any): Promise<import("./entities/installment-contract.entity").InstallmentContract[]>;
    updateContract(id: string, dto: any): Promise<import("./entities/installment-contract.entity").InstallmentContract>;
    removeContract(id: string): Promise<void>;
    getAllPayments(from?: string, to?: string): Promise<import("./entities/installment-payment.entity").InstallmentPayment[]>;
    getPayments(id: string): Promise<import("./entities/installment-payment.entity").InstallmentPayment[]>;
    addPayment(id: string, dto: any): Promise<import("./entities/installment-payment.entity").InstallmentPayment[]>;
    removePayment(id: string): Promise<void>;
    getReports(from?: string, to?: string): Promise<{
        paymentsInPeriod: import("./entities/installment-payment.entity").InstallmentPayment[];
        totalCollected: number;
        totalRemaining: number;
        totalContracts: number;
        activeContracts: number;
        lateContracts: number;
        completedContracts: number;
        cancelledContracts: number;
    }>;
}
