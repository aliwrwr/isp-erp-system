import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { InstallmentCustomer } from './entities/installment-customer.entity';
import { InstallmentContract } from './entities/installment-contract.entity';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(InstallmentCustomer) private customersRepo: Repository<InstallmentCustomer>,
    @InjectRepository(InstallmentContract) private contractsRepo: Repository<InstallmentContract>,
    @InjectRepository(InstallmentPayment)  private paymentsRepo:  Repository<InstallmentPayment>,
    private readonly whatsappService: WhatsappService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────
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

    // Recent contracts
    const recentContracts = await this.contractsRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Overdue contracts (today past due)
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

  // ─── Customers ────────────────────────────────────────────────────
  findAllCustomers(search?: string) {
    if (search) {
      return this.customersRepo.find({
        where: [
          { name: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
          { nationalId: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.customersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneCustomer(id: number) {
    const c = await this.customersRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('العميل غير موجود');
    return c;
  }

  createCustomer(dto: Partial<InstallmentCustomer>) {
    return this.customersRepo.save(this.customersRepo.create(dto));
  }

  async updateCustomer(id: number, dto: Partial<InstallmentCustomer>) {
    await this.customersRepo.update(id, dto);
    return this.findOneCustomer(id);
  }

  async removeCustomer(id: number) {
    await this.customersRepo.delete(id);
  }

  // ─── Contracts ────────────────────────────────────────────────────
  findAllContracts(status?: string, search?: string) {
    const qb = this.contractsRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.payments', 'payments')
      .orderBy('c.createdAt', 'DESC');
    if (status && status !== 'all') qb.andWhere('c.status = :status', { status });
    if (search) qb.andWhere('(c.contractNumber LIKE :s OR c.productName LIKE :s OR customer.name LIKE :s)', { s: `%${search}%` });
    return qb.getMany();
  }

  async findOneContract(id: number) {
    const c = await this.contractsRepo.findOne({
      where: { id },
      relations: ['customer', 'payments'],
    });
    if (!c) throw new NotFoundException('العقد غير موجود');
    return c;
  }

  async createContract(dto: any) {
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

  async updateContract(id: number, dto: any) {
    const updates: any = { ...dto };
    if (dto.customerId) updates.customer = { id: dto.customerId };
    delete updates.customerId;
    await this.contractsRepo.update(id, updates);
    return this.findOneContract(id);
  }

  async removeContract(id: number) {
    await this.paymentsRepo.delete({ contract: { id } });
    await this.contractsRepo.delete(id);
  }

  // ─── Payments ─────────────────────────────────────────────────────
  findPaymentsByContract(contractId: number) {
    return this.paymentsRepo.find({
      where: { contract: { id: contractId } },
      order: { date: 'DESC' },
    });
  }

  async getAllPayments(from?: string, to?: string) {
    const qb = this.paymentsRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.contract', 'contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .orderBy('p.date', 'DESC');
    if (from) qb.andWhere('p.date >= :from', { from });
    if (to)   qb.andWhere('p.date <= :to',   { to });
    return qb.getMany();
  }

  async addPayment(contractId: number, dto: any) {
    const contract = await this.findOneContract(contractId);
    const payment = this.paymentsRepo.create({
      ...dto,
      contract: { id: contractId },
    });
    const saved = await this.paymentsRepo.save(payment);

    // Update contract: remaining and paidCount
    const newPaid = (contract.paidCount || 0) + 1;
    const newRemaining = Math.max(0, Number(contract.remainingAmount) - Number(dto.amount));
    const newStatus = newRemaining <= 0 ? 'completed' : 'active';

    // Next due date (add 1 month for monthly)
    let nextDue = contract.nextDueDate || dto.date;
    if (contract.frequency === 'monthly') {
      const d = new Date(dto.date);
      d.setMonth(d.getMonth() + 1);
      nextDue = d.toISOString().split('T')[0];
    } else if (contract.frequency === 'weekly') {
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

    // Send WhatsApp notification if customer has a phone number
    if (contract.customer?.phone) {
      this.whatsappService.sendInstallmentPaymentReceivedNotification(
        contract.customer.phone,
        contract.customer.name,
        Number(dto.amount),
        contract.contractNumber,
        newPaid,
        newRemaining,
      );
    }

    return saved;
  }

  async removePayment(id: number) {
    await this.paymentsRepo.delete(id);
  }

  // ─── Reports ──────────────────────────────────────────────────────
  async getReports(from?: string, to?: string) {
    const paymentsQb = this.paymentsRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.contract', 'contract')
      .leftJoinAndSelect('contract.customer', 'customer')
      .orderBy('p.date', 'DESC');
    if (from) paymentsQb.andWhere('p.date >= :from', { from });
    if (to)   paymentsQb.andWhere('p.date <= :to',   { to });
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
}
