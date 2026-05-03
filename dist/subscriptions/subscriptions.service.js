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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let SubscriptionsService = class SubscriptionsService {
    subscriptionsRepository;
    paymentsRepository;
    whatsappService;
    constructor(subscriptionsRepository, paymentsRepository, whatsappService) {
        this.subscriptionsRepository = subscriptionsRepository;
        this.paymentsRepository = paymentsRepository;
        this.whatsappService = whatsappService;
    }
    async create(createSubscriptionDto) {
        const subscription = this.subscriptionsRepository.create(createSubscriptionDto);
        const saved = await this.subscriptionsRepository.save(subscription);
        if (this.whatsappService) {
            const full = await this.findOne(saved.id);
            if (full) {
                const subscriber = full.subscriber;
                const pkg = full.package;
                if (subscriber?.phone) {
                    this.whatsappService.sendActivationNotification(subscriber.phone, subscriber.name ?? '', pkg?.name ?? '', full.endDate).catch(() => { });
                }
            }
        }
        return saved;
    }
    findAll() {
        return this.subscriptionsRepository.find({ relations: ['subscriber', 'package'] });
    }
    findOne(id) {
        return this.subscriptionsRepository.findOne({ where: { id }, relations: ['subscriber', 'package'] });
    }
    async update(id, updateSubscriptionDto) {
        await this.subscriptionsRepository.update(id, updateSubscriptionDto);
        const updated = await this.findOne(id);
        if (this.whatsappService && updateSubscriptionDto.status === 'expired' && updated) {
            const subscriber = updated.subscriber;
            const pkg = updated.package;
            if (subscriber?.phone) {
                this.whatsappService.sendExpiryNotification(subscriber.phone, subscriber.name ?? '', pkg?.name ?? '', updated.endDate).catch(() => { });
            }
        }
        return updated;
    }
    async remove(id) {
        await this.subscriptionsRepository.delete(id);
    }
    async pay(id, amount, notes) {
        const sub = await this.findOne(id);
        if (!sub)
            return null;
        const newPaid = Number(sub.paidAmount || 0) + amount;
        const price = Number(sub.price || 0);
        const debt = Number(sub.debtAmount || 0);
        const total = price + debt;
        let newPaymentMethod = sub.paymentMethod || 'cash';
        if (newPaymentMethod === 'credit' || newPaymentMethod === 'partial') {
            if (total > 0 && newPaid >= total) {
                newPaymentMethod = 'cash';
            }
            else if (newPaid > 0) {
                newPaymentMethod = 'partial';
            }
        }
        const existingNotes = sub.notes || '';
        const newNote = notes ? `[تسديد: ${amount} د.ع] ${notes}` : `[تسديد: ${amount} د.ع]`;
        const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
        await this.subscriptionsRepository.update(id, {
            paidAmount: newPaid,
            paymentMethod: newPaymentMethod,
            notes: updatedNotes,
        });
        try {
            const subForPayment = await this.findOne(id);
            await this.paymentsRepository.save({
                subscription: { id },
                subscriber: subForPayment?.subscriber?.id
                    ? { id: subForPayment.subscriber.id }
                    : undefined,
                amount,
                method: 'cash',
                status: 'paid',
                notes: notes || '',
            });
        }
        catch { }
        return this.findOne(id);
    }
    async addDebt(id, amount, notes) {
        const sub = await this.findOne(id);
        if (!sub)
            return null;
        const newDebt = Number(sub.debtAmount || 0) + amount;
        const existingNotes = sub.notes || '';
        const newNote = notes ? `[دين: ${amount} د.ع] ${notes}` : `[دين: ${amount} د.ع]`;
        const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
        await this.subscriptionsRepository.update(id, { debtAmount: newDebt, notes: updatedNotes });
        return this.findOne(id);
    }
    async getTodayStats() {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        await this.subscriptionsRepository.manager.query(`UPDATE subscriptions SET createdAt = startDate
       WHERE substr(createdAt, 1, 10) = ? AND substr(startDate, 1, 10) != ?`, [todayStr, todayStr]);
        const rows = await this.subscriptionsRepository.manager.query(`SELECT paymentMethod, price, paidAmount, debtAmount
       FROM subscriptions WHERE substr(createdAt, 1, 10) = ?`, [todayStr]);
        let collected = 0, totalDebt = 0;
        const activations = rows.length;
        for (const s of rows) {
            const price = Number(s.price || 0);
            const paid = Number(s.paidAmount || 0);
            const debt = Number(s.debtAmount || 0);
            if (s.paymentMethod === 'cash' || s.paymentMethod === 'partial') {
                collected += paid;
            }
            totalDebt += Math.max(0, price + debt - paid);
        }
        const payRows = await this.subscriptionsRepository.manager.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE substr(date, 1, 10) = ?`, [todayStr]);
        const debtPayments = Number(payRows[0]?.total || 0);
        collected += debtPayments;
        return { collected, totalDebt, debtPayments, activations };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map