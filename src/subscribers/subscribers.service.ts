import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Package } from '../packages/entities/package.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
    @Optional() private readonly whatsappService: WhatsappService,
  ) {}

  async create(createSubscriberDto: CreateSubscriberDto): Promise<Subscriber> {
    const { packageId, managerId, subStartDate, subEndDate, paymentMethod: pmCreate, partialAmount: paCreate, ...rest } = createSubscriberDto as any;
    const subscriber = this.subscribersRepository.create({
      ...rest,
      status: 'active',
      // Use provided password or fall back to username
      password: rest.password?.trim() || rest.username,
      ...(packageId ? { package: { id: packageId } } : {}),
      ...(managerId ? { manager: { id: managerId } } : {}),
    });
    const saved = await (this.subscribersRepository.save(subscriber) as unknown as Promise<Subscriber>);

    // Auto-create subscription if startDate is provided
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
          subscriber: { id: saved.id } as any,
          package: { id: packageId } as any,
          startDate: new Date(subStartDate),
          endDate,
          price: Number(pkg?.price || 0),
          paymentMethod: createPm,
          paidAmount: createPaid,
          status: 'active',
        });
        await this.subscriptionsRepository.save(subscription);

        // Send WhatsApp activation notification
        if (this.whatsappService) {
          this.whatsappService.sendActivationNotification(
            saved.phone,
            saved.name,
            pkg?.name ?? '',
            endDate,
          ).catch(() => {});
        }
      }
    }

    return this.findOne(saved.id) as Promise<Subscriber>;
  }

  findAll(): Promise<Subscriber[]> {
    return this.subscribersRepository.find({ relations: ['manager', 'package', 'subscriptions'] });
  }

  findOne(id: number): Promise<Subscriber | null> {
    return this.subscribersRepository.findOne({ where: { id }, relations: ['manager', 'package', 'subscriptions'] });
  }

  async update(id: number, updateSubscriberDto: UpdateSubscriberDto): Promise<Subscriber | null> {
    const { packageId, managerId, subStartDate, subEndDate, paymentMethod, partialAmount, ...rest } = updateSubscriberDto as any;
    await this.subscribersRepository.update(id, {
      ...rest,
      ...(packageId !== undefined ? { package: { id: packageId } } : {}),
      ...(managerId !== undefined ? { manager: { id: managerId } } : {}),
    });

    // Auto-create subscription on package change if startDate provided
    let activationNotificationSent = false;
    if (subStartDate && packageId) {
      const pkg = await this.packagesRepository.findOne({ where: { id: packageId } });
      let endDate = subEndDate ? new Date(subEndDate) : null;
      if (!endDate && pkg?.duration) {
        endDate = new Date(subStartDate);
        endDate.setDate(endDate.getDate() + pkg.duration);
      }
      if (endDate) {
        const paymentMethod = (updateSubscriberDto as any).paymentMethod || 'cash';
        const paidAmt = paymentMethod === 'partial' ? Number(partialAmount || 0) : (paymentMethod === 'cash' ? Number(pkg?.price || 0) : 0);
        const subscription = this.subscriptionsRepository.create({
          subscriber: { id } as any,
          package: { id: packageId } as any,
          startDate: new Date(subStartDate),
          endDate,
          price: Number(pkg?.price || 0),
          paymentMethod,
          paidAmount: paidAmt,
          status: 'active',
        });
        await this.subscriptionsRepository.save(subscription);

        // Send WhatsApp activation notification on new subscription
        if (this.whatsappService) {
          const sub = await this.subscribersRepository.findOne({ where: { id } });
          if (sub) {
            activationNotificationSent = true;
            this.whatsappService.sendActivationNotification(
              sub.phone,
              sub.name,
              pkg?.name ?? '',
              endDate,
            ).catch(() => {});
          }
        }
      }
    }

    // Send WhatsApp activation notification when status explicitly set to active
    // (covers cases where packageId is missing or endDate was null in the block above)
    if (rest.status === 'active' && !activationNotificationSent && this.whatsappService) {
      const sub = await this.findOne(id);
      if (sub) {
        const activeSubscription = (sub as any).subscriptions?.find((s: any) => s.status === 'active');
        this.whatsappService.sendActivationNotification(
          sub.phone,
          sub.name,
          (sub as any).package?.name ?? '',
          activeSubscription?.endDate ?? null,
        ).catch(() => {});
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.subscriptionsRepository.delete({ subscriber: { id } });
    await this.subscribersRepository.delete(id);
  }
}
