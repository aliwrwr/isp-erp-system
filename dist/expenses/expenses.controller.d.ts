import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private readonly service;
    constructor(service: ExpensesService);
    findAll(search?: string, category?: string, dateFrom?: string, dateTo?: string, page?: string, limit?: string): Promise<{
        data: import("./entities/expense.entity").Expense[];
        total: number;
        page: number;
        pages: number;
    }>;
    stats(): Promise<{
        monthTotal: number;
        count: number;
        max: number;
        min: number;
    }>;
    create(dto: any): Promise<import("./entities/expense.entity").Expense>;
    update(id: string, dto: any): Promise<import("./entities/expense.entity").Expense | null>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
