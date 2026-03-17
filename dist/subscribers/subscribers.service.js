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
exports.SubscribersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscriber_entity_1 = require("./entities/subscriber.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const package_entity_1 = require("../packages/entities/package.entity");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let SubscribersService = class SubscribersService {
    subscribersRepository;
    subscriptionsRepository;
    packagesRepository;
    whatsappService;
    constructor(subscribersRepository, subscriptionsRepository, packagesRepository, whatsappService) {
        this.subscribersRepository = subscribersRepository;
        this.subscriptionsRepository = subscriptionsRepository;
        this.packagesRepository = packagesRepository;
        this.whatsappService = whatsappService;
    }
    async create(createSubscriberDto) {
        const { packageId, managerId, subStartDate, subEndDate, paymentMethod: pmCreate, partialAmount: paCreate, ...rest } = createSubscriberDto;
        const subscriber = this.subscribersRepository.create({
            ...rest,
            status: 'active',
            password: rest.username,
            ...(packageId ? { package: { id: packageId } } : {}),
            ...(managerId ? { manager: { id: managerId } } : {}),
        });
        const saved = await this.subscribersRepository.save(subscriber);
        if (subStartDate && packageId) {
            const pkg = await this.packagesRepository.findOne({ where: { id: packageId } });
            let endDate = subEndDate ? new Date(subEndDate) : null;
            if (!endDate && pkg?.duration) {
                endDate = new Date(subStartDate);
                endDate.setDate(endDate.getDate() + pkg.duration);
            }
            if (endDate) {
                const createPm = pmCreate || 'cash';
                const createPaid = createPm === 'partial' ? Number(paCreate || 0) : (createPm === 'cash' ? Number(pkg?.price || 0) : 0);
                const subscription = this.subscriptionsRepository.create({
                    subscriber: { id: saved.id },
                    package: { id: packageId },
                    startDate: new Date(subStartDate),
                    endDate,
                    price: Number(pkg?.price || 0),
                    paymentMethod: createPm,
                    paidAmount: createPaid,
                    status: 'active',
                });
                await this.subscriptionsRepository.save(subscription);
                if (this.whatsappService) {
                    this.whatsappService.sendActivationNotification(saved.phone, saved.name, pkg?.name ?? '', endDate).catch(() => { });
                }
            }
        }
        return this.findOne(saved.id);
    }
    findAll() {
        return this.subscribersRepository.find({ relations: ['manager', 'package', 'subscriptions'] });
    }
    findOne(id) {
        return this.subscribersRepository.findOne({ where: { id }, relations: ['manager', 'package', 'subscriptions'] });
    }
    async update(id, updateSubscriberDto) {
        const { packageId, managerId, subStartDate, subEndDate, paymentMethod, partialAmount, ...rest } = updateSubscriberDto;
        await this.subscribersRepository.update(id, {
            ...rest,
            ...(packageId !== undefined ? { package: { id: packageId } } : {}),
            ...(managerId !== undefined ? { manager: { id: managerId } } : {}),
        });
        let activationNotificationSent = false;
        if (subStartDate && packageId) {
            const pkg = await this.packagesRepository.findOne({ where: { id: packageId } });
            let endDate = subEndDate ? new Date(subEndDate) : null;
            if (!endDate && pkg?.duration) {
                endDate = new Date(subStartDate);
                endDate.setDate(endDate.getDate() + pkg.duration);
            }
            if (endDate) {
                const paymentMethod = updateSubscriberDto.paymentMethod || 'cash';
                const paidAmt = paymentMethod === 'partial' ? Number(partialAmount || 0) : (paymentMethod === 'cash' ? Number(pkg?.price || 0) : 0);
                const subscription = this.subscriptionsRepository.create({
                    subscriber: { id },
                    package: { id: packageId },
                    startDate: new Date(subStartDate),
                    endDate,
                    price: Number(pkg?.price || 0),
                    paymentMethod,
                    paidAmount: paidAmt,
                    status: 'active',
                });
                await this.subscriptionsRepository.save(subscription);
                if (this.whatsappService) {
                    const sub = await this.subscribersRepository.findOne({ where: { id } });
                    if (sub) {
                        activationNotificationSent = true;
                        this.whatsappService.sendActivationNotification(sub.phone, sub.name, pkg?.name ?? '', endDate).catch(() => { });
                    }
                }
            }
        }
        if (rest.status === 'active' && !activationNotificationSent && this.whatsappService) {
            const sub = await this.findOne(id);
            if (sub) {
                const activeSubscription = sub.subscriptions?.find((s) => s.status === 'active');
                this.whatsappService.sendActivationNotification(sub.phone, sub.name, sub.package?.name ?? '', activeSubscription?.endDate ?? null).catch(() => { });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.subscriptionsRepository.delete({ subscriber: { id } });
        await this.subscribersRepository.delete(id);
    }
};
exports.SubscribersService = SubscribersService;
exports.SubscribersService = SubscribersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscriber_entity_1.Subscriber)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(2, (0, typeorm_1.InjectRepository)(package_entity_1.Package)),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], SubscribersService);
//# sourceMappingURL=subscribers.service.js.map