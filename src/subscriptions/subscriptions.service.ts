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
    const price   = Number(sub.price || 0);
    const debt    = Number((sub as any).debtAmount || 0);
    const total   = price + debt;

    // Auto-update paymentMethod based on payment state
    let newPaymentMethod: string = (sub as any).paymentMethod || 'cash';
    if (newPaymentMethod === 'credit' || newPaymentMethod === 'partial') {
      if (total > 0 && newPaid >= total) {
        // Fully paid — mark as cash (no remaining debt)
        newPaymentMethod = 'cash';
      } else if (newPaid > 0) {
        // Partially paid — still has remaining debt
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
    } as any);
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

  async getTodayStats(): Promise<{ collected: number; totalDebt: number; debtPayments: number; activations: number }> {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Fix corrupted createdAt (idempotent: safe to run on every call)
    // TypeORM synchronize:true may have set createdAt=today for all old rows
    await this.subscriptionsRepository.manager.query(
      `UPDATE subscriptions SET createdAt = startDate
       WHERE substr(createdAt, 1, 10) = ? AND substr(startDate, 1, 10) != ?`,
      [todayStr, todayStr],
    );

    // Fetch only today's subscriptions
    const rows: any[] = await this.subscriptionsRepository.manager.query(
      `SELECT paymentMethod, price, paidAmount, debtAmount
       FROM subscriptions WHERE substr(createdAt, 1, 10) = ?`,
      [todayStr],
    );

    let collected = 0, totalDebt = 0, debtPayments = 0;
    const activations = rows.length;

    for (const s of rows) {
      const price = Number(s.price || 0);
      const paid  = Number(s.paidAmount || 0);
      const debt  = Number(s.debtAmount || 0);
      if (s.paymentMethod === 'cash' || s.paymentMethod === 'partial') {
        collected += paid;
      }
      totalDebt += Math.max(0, price + debt - paid);
      if (s.paymentMethod === 'credit' || s.paymentMethod === 'partial') {
        debtPayments += paid;
      }
    }

    return { collected, totalDebt, debtPayments, activations };
  }
}
