import { Repository, DataSource } from 'typeorm';
import { CashboxManual } from './entities/cashbox-manual.entity';
export declare class CashboxService {
    private readonly manualRepo;
    private readonly dataSource;
    constructor(manualRepo: Repository<CashboxManual>, dataSource: DataSource);
    summary(): Promise<{
        balance: number;
        totalIn: number;
        totalOut: number;
        monthIn: number;
        monthOut: number;
        monthCount: number;
    }>;
    ledger(query: {
        search?: string;
        type?: string;
        source?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    createManual(dto: Partial<CashboxManual>): Promise<CashboxManual>;
    removeManual(id: number): Promise<{
        success: boolean;
    }>;
}
