import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class GlobalReportsService {
  constructor(private dataSource: DataSource) {}

  async getDashboardData(period: string, system?: string) {
    let dateFilter = '';
    const now = new Date();
    if (period === 'today') {
      dateFilter = `date('now', 'localtime')`;
    } else if (period === 'week') {
      dateFilter = `date('now', '-7 days', 'localtime')`;
    } else if (period === 'month') {
      dateFilter = `date('now', 'start of month', 'localtime')`;
    } else if (period === 'year') {
      dateFilter = `date('now', 'start of year', 'localtime')`;
    } else {
      dateFilter = `date('now', 'start of month', 'localtime')`; // Default month
    }

    try {
      // 1. Subscriptions Income
      const subRes = await this.dataSource.query(
        `SELECT SUM(paidAmount) as total FROM subscriptions WHERE date(startDate) >= ${period === 'today' ? dateFilter : dateFilter} ${period === 'today' ? `AND date(startDate) = ${dateFilter}` : ''}`
      );
      
      // 2. Sales Invoices Income
      const invRes = await this.dataSource.query(
        `SELECT SUM(paidAmount) as total FROM invoices WHERE date(date) >= ${period === 'today' ? dateFilter : dateFilter} ${period === 'today' ? `AND date(date) = ${dateFilter}` : ''}`
      );

      // 3. Installments Payments
      const instRes = await this.dataSource.query(
        `SELECT SUM(amount) as total FROM installment_payment WHERE date(paymentDate) >= ${period === 'today' ? dateFilter : dateFilter} ${period === 'today' ? `AND date(paymentDate) = ${dateFilter}` : ''}`
      ).catch(() => [{ total: 0 }]); // Ignore if table doesn't exist yet

      // 4. Restaurant Orders
      const restRes = await this.dataSource.query(
        `SELECT SUM(totalAmount) as total FROM restaurant_orders WHERE status = 'paid' AND date(createdAt) >= ${period === 'today' ? dateFilter : dateFilter} ${period === 'today' ? `AND date(createdAt) = ${dateFilter}` : ''}`
      ).catch(() => [{ total: 0 }]);

      // 5. Total Expenses
      const expRes = await this.dataSource.query(
        `SELECT SUM(amount) as total FROM expenses WHERE date(date) >= ${period === 'today' ? dateFilter : dateFilter} ${period === 'today' ? `AND date(date) = ${dateFilter}` : ''}`
      );

      // 6. Active Subscribers Count
      const activeSubsRes = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`
      );

      const incomeSub = Number(subRes[0]?.total || 0);
      const incomeInv = Number(invRes[0]?.total || 0);
      const incomeInst = Number(instRes[0]?.total || 0);
      const incomeRest = Number(restRes[0]?.total || 0);
      
let totalIncome = incomeSub + incomeInv + incomeInst + incomeRest;      
      let totalExpenses = Number(expRes[0]?.total || 0);

      if (system && system !== 'all') {
        if (system === 'internet') {
            totalIncome = incomeSub;
        } else if (system === 'sales') {
            totalIncome = incomeInv;
            totalExpenses = 0; // Assuming expenses aren't clearly divided yet
        } else if (system === 'installments') {
            totalIncome = incomeInst;
            totalExpenses = 0;
        } else if (system === 'restaurant') {
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
    } catch (e) {
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
}
