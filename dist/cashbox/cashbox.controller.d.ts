import { CashboxService } from './cashbox.service';
export declare class CashboxController {
    private readonly service;
    constructor(service: CashboxService);
    summary(): Promise<{
        balance: number;
        totalIn: number;
        totalOut: number;
        monthIn: number;
        monthOut: number;
        monthCount: number;
    }>;
    ledger(search?: string, type?: string, source?: string, dateFrom?: string, dateTo?: string, page?: string, limit?: string): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    createManual(dto: any): Promise<import("./entities/cashbox-manual.entity").CashboxManual>;
    removeManual(id: string): Promise<{
        success: boolean;
    }>;
}
