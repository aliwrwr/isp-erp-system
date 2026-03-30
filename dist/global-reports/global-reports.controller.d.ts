import { GlobalReportsService } from './global-reports.service';
export declare class GlobalReportsController {
    private readonly globalReportsService;
    constructor(globalReportsService: GlobalReportsService);
    getDashboardData(period?: string, system?: string): Promise<{
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
