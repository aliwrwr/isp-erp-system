"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let GlobalReportsService = class GlobalReportsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getDashboardData(period, system, startDate, endDate) {
        let whereClauseSub = '';
        let whereClauseInv = '';
        let whereClauseInst = '';
        let whereClauseRest = `status = 'paid'`;
        let whereClauseExp = '';
        if (period === 'custom' && startDate && endDate) {
            whereClauseSub = `datetime(startDate) >= datetime('${startDate}') AND datetime(startDate) <= datetime('${endDate}')`;
            whereClauseInv = `datetime(date) >= datetime('${startDate}') AND datetime(date) <= datetime('${endDate}')`;
            whereClauseInst = `datetime(paymentDate) >= datetime('${startDate}') AND datetime(paymentDate) <= datetime('${endDate}')`;
            whereClauseRest += ` AND datetime(createdAt) >= datetime('${startDate}') AND datetime(createdAt) <= datetime('${endDate}')`;
            whereClauseExp = `datetime(date) >= datetime('${startDate}') AND datetime(date) <= datetime('${endDate}')`;
        }
        else {
            let dateFilter = '';
            if (period === 'today') {
                dateFilter = `date('now', 'localtime')`;
            }
            else if (period === 'week') {
                dateFilter = `date('now', '-7 days', 'localtime')`;
            }
            else if (period === 'month') {
                dateFilter = `date('now', 'start of month', 'localtime')`;
            }
            else if (period === 'year') {
                dateFilter = `date('now', 'start of year', 'localtime')`;
            }
            else {
                dateFilter = `date('now', 'start of month', 'localtime')`;
            }
            whereClauseSub = `date(startDate) >= ${dateFilter} ${period === 'today' ? `AND date(startDate) = ${dateFilter}` : ''}`;
            whereClauseInv = `date(date) >= ${dateFilter} ${period === 'today' ? `AND date(date) = ${dateFilter}` : ''}`;
            whereClauseInst = `date(paymentDate) >= ${dateFilter} ${period === 'today' ? `AND date(paymentDate) = ${dateFilter}` : ''}`;
            whereClauseRest += ` AND date(createdAt) >= ${dateFilter} ${period === 'today' ? `AND date(createdAt) = ${dateFilter}` : ''}`;
            whereClauseExp = `date(date) >= ${dateFilter} ${period === 'today' ? `AND date(date) = ${dateFilter}` : ''}`;
        }
        try {
            const subRes = await this.dataSource.query(`SELECT SUM(paidAmount) as total FROM subscriptions ${whereClauseSub ? 'WHERE ' + whereClauseSub : ''}`);
            const invRes = await this.dataSource.query(`SELECT SUM(paidAmount) as total FROM invoices ${whereClauseInv ? 'WHERE ' + whereClauseInv : ''}`);
            const instRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM installment_payment ${whereClauseInst ? 'WHERE ' + whereClauseInst : ''}`).catch(() => [{ total: 0 }]);
            const restRes = await this.dataSource.query(`SELECT SUM(totalAmount) as total FROM restaurant_orders ${whereClauseRest ? 'WHERE ' + whereClauseRest : ''}`).catch(() => [{ total: 0 }]);
            const expRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM expenses ${whereClauseExp ? 'WHERE ' + whereClauseExp : ''}`);
            const activeSubsRes = await this.dataSource.query(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`);
            const incomeSub = Number(subRes[0]?.total || 0);
            const incomeInv = Number(invRes[0]?.total || 0);
            const incomeInst = Number(instRes[0]?.total || 0);
            const incomeRest = Number(restRes[0]?.total || 0);
            let totalIncome = incomeSub + incomeInv + incomeInst + incomeRest;
            let totalExpenses = Number(expRes[0]?.total || 0);
            if (system && system !== 'all') {
                if (system === 'internet') {
                    totalIncome = incomeSub;
                }
                else if (system === 'sales') {
                    totalIncome = incomeInv;
                    totalExpenses = 0;
                }
                else if (system === 'installments') {
                    totalIncome = incomeInst;
                    totalExpenses = 0;
                }
                else if (system === 'restaurant') {
                    totalIncome = incomeRest;
                    totalExpenses = 0;
                }
            }
            const netProfit = totalIncome - totalExpenses;
            return {
                totalIncome,
                totalExpenses,
                netProfit,
                breakdown: {
                    internet: incomeSub,
                    sales: incomeInv,
                    installments: incomeInst,
                    restaurant: incomeRest,
                },
                activeSubscribers: Number(activeSubsRes[0]?.count || 0)
            };
        }
        catch (e) {
            console.error('Error fetching global reports', e);
            return {
                totalIncome: 0,
                totalExpenses: 0,
                netProfit: 0,
                breakdown: { internet: 0, sales: 0, installments: 0, restaurant: 0 },
                activeSubscribers: 0
            };
        }
    }
};
exports.GlobalReportsService = GlobalReportsService;
exports.GlobalReportsService = GlobalReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], GlobalReportsService);
//# sourceMappingURL=global-reports.service.js.map