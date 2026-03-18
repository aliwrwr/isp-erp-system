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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashboxService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cashbox_manual_entity_1 = require("./entities/cashbox-manual.entity");
let CashboxService = class CashboxService {
    manualRepo;
    dataSource;
    constructor(manualRepo, dataSource) {
        this.manualRepo = manualRepo;
        this.dataSource = dataSource;
    }
    async summary() {
        const now = new Date();
        const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const lastOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
        const invTotal = await this.dataSource.query(`SELECT COALESCE(SUM(paidAmount), 0) AS val FROM invoices WHERE paymentStatus = 'paid'`);
        const expTotal = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM expenses`);
        const manInTotal = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'in'`);
        const manOutTotal = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'out'`);
        const monthIn = await this.dataSource.query(`SELECT COALESCE(SUM(paidAmount), 0) AS val FROM invoices WHERE paymentStatus = 'paid' AND DATE(date) >= ? AND DATE(date) <= ?`, [firstOfMonth, lastOfMonth]);
        const monthManIn = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'in' AND date >= ? AND date <= ?`, [firstOfMonth, lastOfMonth]);
        const monthOut = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM expenses WHERE date >= ? AND date <= ?`, [firstOfMonth, lastOfMonth]);
        const monthManOut = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) AS val FROM cashbox_manual WHERE type = 'out' AND date >= ? AND date <= ?`, [firstOfMonth, lastOfMonth]);
        const monthCount = await this.dataSource.query(`
      SELECT COUNT(*) AS cnt FROM (
        SELECT id FROM invoices WHERE paymentStatus = 'paid' AND DATE(date) >= ? AND DATE(date) <= ?
        UNION ALL
        SELECT id FROM expenses WHERE date >= ? AND date <= ?
        UNION ALL
        SELECT id FROM cashbox_manual WHERE date >= ? AND date <= ?
      )
    `, [firstOfMonth, lastOfMonth, firstOfMonth, lastOfMonth, firstOfMonth, lastOfMonth]);
        const totalIn = Number(invTotal[0].val) + Number(manInTotal[0].val);
        const totalOut = Number(expTotal[0].val) + Number(manOutTotal[0].val);
        const balance = totalIn - totalOut;
        const mthIn = Number(monthIn[0].val) + Number(monthManIn[0].val);
        const mthOut = Number(monthOut[0].val) + Number(monthManOut[0].val);
        return {
            balance,
            totalIn,
            totalOut,
            monthIn: mthIn,
            monthOut: mthOut,
            monthCount: Number(monthCount[0].cnt),
        };
    }
    async ledger(query) {
        const { search = '', type = '', source = '', dateFrom = '', dateTo = '', page = 1, limit = 20 } = query;
        const whereClauses = [];
        const params = [];
        if (type) {
            whereClauses.push(`type = ?`);
            params.push(type);
        }
        if (source) {
            whereClauses.push(`source = ?`);
            params.push(source);
        }
        if (dateFrom) {
            whereClauses.push(`date >= ?`);
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClauses.push(`date <= ?`);
            params.push(dateTo);
        }
        if (search) {
            whereClauses.push(`description LIKE ?`);
            params.push(`%${search}%`);
        }
        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
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
        const dataSQL = `SELECT * FROM (${unionSQL}) combined ${whereSQL} ORDER BY sortDate DESC, source LIMIT ? OFFSET ?`;
        const countResult = await this.dataSource.query(countSQL, params);
        const dataResult = await this.dataSource.query(dataSQL, [...params, limit, offset]);
        const total = Number(countResult[0].total);
        return {
            data: dataResult,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async createManual(dto) {
        const item = this.manualRepo.create(dto);
        return this.manualRepo.save(item);
    }
    async removeManual(id) {
        await this.manualRepo.delete(id);
        return { success: true };
    }
};
exports.CashboxService = CashboxService;
exports.CashboxService = CashboxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cashbox_manual_entity_1.CashboxManual)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], CashboxService);
//# sourceMappingURL=cashbox.service.js.map