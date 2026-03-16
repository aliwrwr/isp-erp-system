import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @Optional() private readonly whatsappService: WhatsappService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionsRepository.create(createSubscriptionDto);
    const saved = await this.subscriptionsRepository.save(subscription);

    // Send activation notification via WhatsApp
    if (this.whatsappService) {
      const full = await this.findOne(saved.id);
      if (full) {
        const subscriber = (full as any).subscriber;
        const pkg = (full as any).package;
        if (subscriber?.phone) {
          this.whatsappService.sendActivationNotification(
            subscriber.phone,
            subscriber.name ?? '',
            pkg?.name ?? '',
            full.endDate,
          ).catch(() => {});
        }
      }
    }

    return saved;
  }

  findAll(): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({ relations: ['subscriber', 'package'] });
  }

  findOne(id: number): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({ where: { id }, relations: ['subscriber', 'package'] });
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription | null> {
    await this.subscriptionsRepository.update(id, updateSubscriptionDto as any);
    const updated = await this.findOne(id);

    // Send expiry notification when status manually set to expired
    if (this.whatsappService && (updateSubscriptionDto as any).status === 'expired' && updated) {
      const subscriber = (updated as any).subscriber;
      const pkg = (updated as any).package;
      if (subscriber?.phone) {
        this.whatsappService.sendExpiryNotification(
          subscriber.phone,
          subscriber.name ?? '',
          pkg?.name ?? '',
          updated.endDate,
        ).catch(() => {});
      }
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.subscriptionsRepository.delete(id);
  }

  async pay(id: number, amount: number, notes?: string): Promise<Subscription | null> {
    const sub = await this.findOne(id);
    if (!sub) return null;
    const newPaid = Number(sub.paidAmount || 0) + amount;
    const existingNotes = sub.notes || '';
    const newNote = notes ? `[تسديد: ${amount} د.ع] ${notes}` : `[تسديد: ${amount} د.ع]`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
    await this.subscriptionsRepository.update(id, { paidAmount: newPaid, notes: updatedNotes } as any);
    return this.findOne(id);
  }

  async addDebt(id: number, amount: number, notes?: string): Promise<Subscription | null> {
    const sub = await this.findOne(id);
    if (!sub) return null;
    const newDebt = Number((sub as any).debtAmount || 0) + amount;
    const existingNotes = sub.notes || '';
    const newNote = notes ? `[دين: ${amount} د.ع] ${notes}` : `[دين: ${amount} د.ع]`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;
    await this.subscriptionsRepository.update(id, { debtAmount: newDebt, notes: updatedNotes } as any);
    return this.findOne(id);
  }
}
