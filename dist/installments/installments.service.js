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
exports.InstallmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const installment_customer_entity_1 = require("./entities/installment-customer.entity");
const installment_contract_entity_1 = require("./entities/installment-contract.entity");
const installment_payment_entity_1 = require("./entities/installment-payment.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let InstallmentsService = class InstallmentsService {
    customersRepo;
    contractsRepo;
    paymentsRepo;
    whatsappService;
    constructor(customersRepo, contractsRepo, paymentsRepo, whatsappService) {
        this.customersRepo = customersRepo;
        this.contractsRepo = contractsRepo;
        this.paymentsRepo = paymentsRepo;
        this.whatsappService = whatsappService;
    }
    async getDashboard() {
        const [totalCustomers, totalContracts, activeContracts, lateContracts] = await Promise.all([
            this.customersRepo.count(),
            this.contractsRepo.count(),
            this.contractsRepo.count({ where: { status: 'active' } }),
            this.contractsRepo.count({ where: { status: 'late' } }),
        ]);
        const paymentsResult = await this.paymentsRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .getRawOne();
        const totalCollected = Number(paymentsResult?.total || 0);
        const contractsResult = await this.contractsRepo
            .createQueryBuilder('c')
            .select('SUM(c.remainingAmount)', 'total')
            .getRawOne();
        const totalRemaining = Number(contractsResult?.total || 0);
        const recentContracts = await this.contractsRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const today = new Date().toISOString().split('T')[0];
        const overdueContracts = await this.contractsRepo
            .createQueryBuilder('c')
            .where('c.nextDueDate < :today', { today })
            .andWhere('c.status = :status', { status: 'active' })
            .getCount();
        return {
            totalCustomers,
            totalContracts,
            activeContracts,
            lateContracts,
            totalCollected,
            totalRemaining,
            overdueContracts,
            recentContracts,
        };
    }
    findAllCustomers(search) {
        if (search) {
            return this.customersRepo.find({
                where: [
                    { name: (0, typeorm_2.Like)(`%${search}%`) },
                    { phone: (0, typeorm_2.Like)(`%${search}%`) },
                    { nationalId: (0, typeorm_2.Like)(`%${search}%`) },
                ],
                order: { createdAt: 'DESC' },
            });
        }
        return this.customersRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findOneCustomer(id) {
        const c = await this.customersRepo.findOne({ where: { id } });
        if (!c)
            throw new common_1.NotFoundException('العميل غير موجود');
        return c;
    }
    createCustomer(dto) {
        return this.customersRepo.save(this.customersRepo.create(dto));
    }
    async updateCustomer(id, dto) {
        await this.customersRepo.update(id, dto);
        return this.findOneCustomer(id);
    }
    async removeCustomer(id) {
        await this.customersRepo.delete(id);
    }
    findAllContracts(status, search) {
        const qb = this.contractsRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.customer', 'customer')
            .leftJoinAndSelect('c.payments', 'payments')
            .orderBy('c.createdAt', 'DESC');
        if (status && status !== 'all')
            qb.andWhere('c.status = :status', { status });
        if (search)
            qb.andWhere('(c.contractNumber LIKE :s OR c.productName LIKE :s OR customer.name LIKE :s)', { s: `%${search}%` });
        return qb.getMany();
    }
    async findOneContract(id) {
        const c = await this.contractsRepo.findOne({
            where: { id },
            relations: ['customer', 'payments'],
        });
        if (!c)
            throw new common_1.NotFoundException('العقد غير موجود');
        return c;
    }
    async createContract(dto) {
        const count = await this.contractsRepo.count();
        const contractNumber = `INST-${String(count + 1).padStart(5, '0')}`;
        const remaining = Number(dto.totalPrice) - Number(dto.downPayment || 0);
        const contract = this.contractsRepo.create({
            ...dto,
            contractNumber,
            remainingAmount: remaining,
            paidCount: 0,
            customer: { id: dto.customerId },
        });
        return this.contractsRepo.save(contract);
    }
    async updateContract(id, dto) {
        const updates = { ...dto };
        if (dto.customerId)
            updates.customer = { id: dto.customerId };
        delete updates.customerId;
        await this.contractsRepo.update(id, updates);
        return this.findOneContract(id);
    }
    async removeContract(id) {
        await this.paymentsRepo.delete({ contract: { id } });
        await this.contractsRepo.delete(id);
    }
    findPaymentsByContract(contractId) {
        return this.paymentsRepo.find({
            where: { contract: { id: contractId } },
            order: { date: 'DESC' },
        });
    }
    async getAllPayments(from, to) {
        const qb = this.paymentsRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.contract', 'contract')
            .leftJoinAndSelect('contract.customer', 'customer')
            .orderBy('p.date', 'DESC');
        if (from)
            qb.andWhere('p.date >= :from', { from });
        if (to)
            qb.andWhere('p.date <= :to', { to });
        return qb.getMany();
    }
    async addPayment(contractId, dto) {
        const contract = await this.findOneContract(contractId);
        const payment = this.paymentsRepo.create({
            ...dto,
            contract: { id: contractId },
        });
        const saved = await this.paymentsRepo.save(payment);
        const newPaid = (contract.paidCount || 0) + 1;
        const newRemaining = Math.max(0, Number(contract.remainingAmount) - Number(dto.amount));
        const newStatus = newRemaining <= 0 ? 'completed' : 'active';
        let nextDue = contract.nextDueDate || dto.date;
        if (contract.frequency === 'monthly') {
            const d = new Date(dto.date);
            d.setMonth(d.getMonth() + 1);
            nextDue = d.toISOString().split('T')[0];
        }
        else if (contract.frequency === 'weekly') {
            const d = new Date(dto.date);
            d.setDate(d.getDate() + 7);
            nextDue = d.toISOString().split('T')[0];
        }
        await this.contractsRepo.update(contractId, {
            paidCount: newPaid,
            remainingAmount: newRemaining,
            status: newStatus,
            nextDueDate: nextDue,
        });
        if (contract.customer?.phone) {
            this.whatsappService.sendInstallmentPaymentReceivedNotification(contract.customer.phone, contract.customer.name, Number(dto.amount), contract.contractNumber, newPaid, newRemaining);
        }
        return saved;
    }
    async removePayment(id) {
        await this.paymentsRepo.delete(id);
    }
    async getReports(from, to) {
        const paymentsQb = this.paymentsRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.contract', 'contract')
            .leftJoinAndSelect('contract.customer', 'customer')
            .orderBy('p.date', 'DESC');
        if (from)
            paymentsQb.andWhere('p.date >= :from', { from });
        if (to)
            paymentsQb.andWhere('p.date <= :to', { to });
        const paymentsInPeriod = await paymentsQb.getMany();
        const totalCollected = paymentsInPeriod.reduce((s, p) => s + Number(p.amount), 0);
        const [totalContracts, activeContracts, lateContracts, completedContracts, cancelledContracts] = await Promise.all([
            this.contractsRepo.count(),
            this.contractsRepo.count({ where: { status: 'active' } }),
            this.contractsRepo.count({ where: { status: 'late' } }),
            this.contractsRepo.count({ where: { status: 'completed' } }),
            this.contractsRepo.count({ where: { status: 'cancelled' } }),
        ]);
        const remainResult = await this.contractsRepo
            .createQueryBuilder('c')
            .where('c.status IN (:...statuses)', { statuses: ['active', 'late'] })
            .select('SUM(c.remainingAmount)', 'total')
            .getRawOne();
        const totalRemaining = Number(remainResult?.total || 0);
        return {
            paymentsInPeriod,
            totalCollected,
            totalRemaining,
            totalContracts,
            activeContracts,
            lateContracts,
            completedContracts,
            cancelledContracts,
        };
    }
};
exports.InstallmentsService = InstallmentsService;
exports.InstallmentsService = InstallmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(installment_customer_entity_1.InstallmentCustomer)),
    __param(1, (0, typeorm_1.InjectRepository)(installment_contract_entity_1.InstallmentContract)),
    __param(2, (0, typeorm_1.InjectRepository)(installment_payment_entity_1.InstallmentPayment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], InstallmentsService);
//# sourceMappingURL=installments.service.js.map