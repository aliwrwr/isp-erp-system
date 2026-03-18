import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
export declare class ExpensesService {
    private repo;
    constructor(repo: Repository<Expense>);
    findAll(query: {
        search?: string;
        category?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Expense[];
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
    create(dto: Partial<Expense>): Promise<Expense>;
    update(id: number, dto: Partial<Expense>): Promise<Expense | null>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
