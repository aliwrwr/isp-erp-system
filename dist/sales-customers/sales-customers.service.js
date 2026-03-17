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
exports.SalesCustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_customer_entity_1 = require("./entities/sales-customer.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
let SalesCustomersService = class SalesCustomersService {
    repo;
    invoicesRepo;
    constructor(repo, invoicesRepo) {
        this.repo = repo;
        this.invoicesRepo = invoicesRepo;
    }
    create(dto) {
        const customer = this.repo.create(dto);
        return this.repo.save(customer);
    }
    async findAll() {
        const customers = await this.repo.find({ order: { createdAt: 'DESC' } });
        const invoices = await this.invoicesRepo.find();
        return customers.map(c => {
            const related = invoices.filter(inv => (c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
                (!c.phone && inv.customerName === c.name));
            const totalSales = related.reduce((s, i) => s + Number(i.total), 0);
            const totalDebt = related
                .filter(i => i.paymentStatus !== 'paid')
                .reduce((s, i) => s + (Number(i.total) - Number(i.paidAmount || 0)), 0);
            return { ...c, invoiceCount: related.length, totalSales, totalDebt };
        });
    }
    async findOne(id) {
        const c = await this.repo.findOneBy({ id });
        if (!c)
            throw new common_1.NotFoundException('العميل غير موجود');
        return c;
    }
    async update(id, dto) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
    async getInvoices(id) {
        const c = await this.findOne(id);
        const invoices = await this.invoicesRepo.find({ order: { date: 'DESC' } });
        return invoices.filter(inv => (c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
            (!c.phone && inv.customerName === c.name));
    }
    async recordPayment(id, amount) {
        const c = await this.findOne(id);
        const invoices = await this.invoicesRepo.find({ order: { date: 'ASC' } });
        const related = invoices.filter(inv => inv.paymentStatus !== 'paid' &&
            ((c.phone && inv.customerPhone && inv.customerPhone === c.phone) ||
                (!c.phone && inv.customerName === c.name)));
        let remaining = amount;
        for (const inv of related) {
            if (remaining <= 0)
                break;
            const debt = Number(inv.total) - Number(inv.paidAmount || 0);
            if (debt <= 0)
                continue;
            const settle = Math.min(debt, remaining);
            inv.paidAmount = Number(inv.paidAmount || 0) + settle;
            if (inv.paidAmount >= Number(inv.total))
                inv.paymentStatus = 'paid';
            else
                inv.paymentStatus = 'partial';
            remaining -= settle;
            await this.invoicesRepo.save(inv);
        }
        return { settled: amount - remaining };
    }
    async addCharge(id, amount, note) {
        const c = await this.findOne(id);
        const count = await this.invoicesRepo.count();
        const inv = this.invoicesRepo.create({
            invoiceNumber: `CHG-${Date.now()}`,
            customerName: c.name,
            customerPhone: c.phone || '',
            total: amount,
            paidAmount: 0,
            paymentStatus: 'unpaid',
            paymentMethod: 'debt',
            notes: note || 'إضافة دين',
            discount: 0,
            tax: 0,
        });
        return this.invoicesRepo.save(inv);
    }
};
exports.SalesCustomersService = SalesCustomersService;
exports.SalesCustomersService = SalesCustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_customer_entity_1.SalesCustomer)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SalesCustomersService);
//# sourceMappingURL=sales-customers.service.js.map