import { DataSource } from 'typeorm';
export declare class GlobalReportsService {
    private dataSource;
    constructor(dataSource: DataSource);
    getDashboardData(period: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        breakdown: {
            internet: number;
            sales: number;
            installments: number;
            restaurant: number;
        };
        activeSubscribers: number;
    }>;
}
