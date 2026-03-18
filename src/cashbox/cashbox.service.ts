import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CashboxManual } from './entities/cashbox-manual.entity';

@Injectable()
export class CashboxService {
  constructor(
    @InjectRepository(CashboxManual)
    private readonly manualRepo: Repository<CashboxManual>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Summary Stats ──────────────────────────────────────────────────────────
  async summary() {
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastOfMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

    // Total paid invoices (all time)
    const invTotal = await this.dataSource.query(
      `SELECT COALESCE(SUM(paidAmount), 0) AS val FROM invoices WHERE paymentStatus = 'paid'`
    );
    // Total expenses (all time)
    const expTotal = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM expenses`
    );
    // Total manual in (all time)
    const manInTotal = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'in'`
    );
    // Total manual out (all time)
    const manOutTotal = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'out'`
    );

    // This month in
    const monthIn = await this.dataSource.query(
      `SELECT COALESCE(SUM(paidAmount), 0) AS val FROM invoices WHERE paymentStatus = 'paid' AND DATE(date) >= ? AND DATE(date) <= ?`,
      [firstOfMonth, lastOfMonth]
    );
    const monthManIn = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'in' AND date >= ? AND date <= ?`,
      [firstOfMonth, lastOfMonth]
    );

    // This month out
    const monthOut = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM expenses WHERE date >= ? AND date <= ?`,
      [firstOfMonth, lastOfMonth]
    );
    const monthManOut = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'out' AND date >= ? AND date <= ?`,
      [firstOfMonth, lastOfMonth]
    );

    // This month count
    const monthCount = await this.dataSource.query(`
      SELECT COUNT(*) AS cnt FROM (
        SELECT id FROM invoices WHERE paymentStatus = 'paid' AND DATE(date) >= ? AND DATE(date) <= ?
        UNION ALL
        SELECT id FROM expenses WHERE date >= ? AND date <= ?
        UNION ALL
        SELECT id FROM cashbox_manual WHERE date >= ? AND date <= ?
      )
    `, [firstOfMonth, lastOfMonth, firstOfMonth, lastOfMonth, firstOfMonth, lastOfMonth]);

    const totalIn  = Number(invTotal[0].val)  + Number(manInTotal[0].val);
    const totalOut = Number(expTotal[0].val) + Number(manOutTotal[0].val);
    const balance  = totalIn - totalOut;
    const mthIn    = Number(monthIn[0].val) + Number(monthManIn[0].val);
    const mthOut   = Number(monthOut[0].val) + Number(monthManOut[0].val);

    return {
      balance,
      totalIn,
      totalOut,
      monthIn:  mthIn,
      monthOut: mthOut,
      monthCount: Number(monthCount[0].cnt),
    };
  }

  // ─── Combined Ledger ─────────────────────────────────────────────────────────
  async ledger(query: {
    search?: string;
    type?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', type = '', source = '', dateFrom = '', dateTo = '', page = 1, limit = 20 } = query;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (type)     { whereClauses.push(`type = ?`);        params.push(type); }
    if (source)   { whereClauses.push(`source = ?`);      params.push(source); }
    if (dateFrom) { whereClauses.push(`date >= ?`);       params.push(dateFrom); }
    if (dateTo)   { whereClauses.push(`date <= ?`);       params.push(dateTo); }
    if (search)   { whereClauses.push(`description LIKE ?`); params.push(`%${search}%`); }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const offset   = (page - 1) * limit;

    const unionSQL = `
      SELECT 'invoice' AS source, CAST(i.id AS TEXT) AS sourceId, 'in' AS type,
             CAST(i.paidAmount AS REAL) AS amount,
             COALESCE(i.customerName, 'عميل') || ' - فاتورة #' || i.invoiceNumber AS description,
             DATE(i.date) AS date,
             i.invoiceNumber AS reference,
             0 AS deletable,
             DATE(i.date) AS sortDate
      FROM invoices i
      WHERE i.paymentStatus = 'paid' AND i.paidAmount > 0

      UNION ALL

      SELECT 'expense' AS source, CAST(e.id AS TEXT), 'out',
             CAST(e.amount AS REAL),
             COALESCE(e.recipientName, '') ||
               CASE WHEN e.description IS NOT NULL AND e.description != '' THEN ' - ' || e.description ELSE '' END,
             e.date,
             e.category,
             0,
             e.date
      FROM expenses e

      UNION ALL

      SELECT 'manual' AS source, CAST(m.id AS TEXT), m.type,
             CAST(m.amount AS REAL),
             m.description,
             m.date,
             COALESCE(m.reference, ''),
             1,
             m.date
      FROM cashbox_manual m
    `;

    const countSQL = `SELECT COUNT(*) AS total FROM (${unionSQL}) combined ${whereSQL}`;
    const dataSQL  = `SELECT * FROM (${unionSQL}) combined ${whereSQL} ORDER BY sortDate DESC, source LIMIT ? OFFSET ?`;

    // For count, params don't include limit/offset
    const countResult = await this.dataSource.query(countSQL, params);
    const dataResult  = await this.dataSource.query(dataSQL, [...params, limit, offset]);

    const total = Number(countResult[0].total);
    return {
      data:  dataResult,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Manual Entries ───────────────────────────────────────────────────────────
  async createManual(dto: Partial<CashboxManual>) {
    const item = this.manualRepo.create(dto);
    return this.manualRepo.save(item);
  }

  async removeManual(id: number) {
    await this.manualRepo.delete(id);
    return { success: true };
  }
}
