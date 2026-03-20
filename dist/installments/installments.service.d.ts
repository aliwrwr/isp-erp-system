import { Repository } from 'typeorm';
import { InstallmentCustomer } from './entities/installment-customer.entity';
import { InstallmentContract } from './entities/installment-contract.entity';
import { InstallmentPayment } from './entities/installment-payment.entity';
export declare class InstallmentsService {
    private customersRepo;
    private contractsRepo;
    private paymentsRepo;
    constructor(customersRepo: Repository<InstallmentCustomer>, contractsRepo: Repository<InstallmentContract>, paymentsRepo: Repository<InstallmentPayment>);
    getDashboard(): Promise<{
        totalCustomers: number;
        totalContracts: number;
        activeContracts: number;
        lateContracts: number;
        totalCollected: number;
        totalRemaining: number;
        overdueContracts: number;
        recentContracts: InstallmentContract[];
    }>;
    findAllCustomers(search?: string): Promise<InstallmentCustomer[]>;
    findOneCustomer(id: number): Promise<InstallmentCustomer>;
    createCustomer(dto: Partial<InstallmentCustomer>): Promise<InstallmentCustomer>;
    updateCustomer(id: number, dto: Partial<InstallmentCustomer>): Promise<InstallmentCustomer>;
    removeCustomer(id: number): Promise<void>;
    findAllContracts(status?: string, search?: string): Promise<InstallmentContract[]>;
    findOneContract(id: number): Promise<InstallmentContract>;
    createContract(dto: any): Promise<InstallmentContract[]>;
    updateContract(id: number, dto: any): Promise<InstallmentContract>;
    removeContract(id: number): Promise<void>;
    findPaymentsByContract(contractId: number): Promise<InstallmentPayment[]>;
    getAllPayments(from?: string, to?: string): Promise<InstallmentPayment[]>;
    addPayment(contractId: number, dto: any): Promise<InstallmentPayment[]>;
    removePayment(id: number): Promise<void>;
    getReports(from?: string, to?: string): Promise<{
        paymentsInPeriod: InstallmentPayment[];
        totalCollected: number;
        totalRemaining: number;
        totalContracts: number;
        activeContracts: number;
        lateContracts: number;
        completedContracts: number;
        cancelledContracts: number;
    }>;
}
