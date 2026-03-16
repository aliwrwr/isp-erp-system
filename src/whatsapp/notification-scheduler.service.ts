import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private whatsappService: WhatsappService,
  ) {}

  // Runs every day at 08:00 AM
  @Cron('0 8 * * *')
  async sendDailyNotifications(): Promise<void> {
    this.logger.log('Running daily WhatsApp notification check...');
    const settings = await this.whatsappService.getSettings();

    if (!settings.expiryWarningEnabled && !settings.expiryEnabled) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── Expiry today ──────────────────────────────────────────────────────────
    if (settings.expiryEnabled) {
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const expiredToday = await this.subscriptionsRepository.find({
        where: { endDate: Between(today as any, todayEnd as any) as any, status: 'active' },
        relations: ['subscriber', 'package'],
      });

      for (const sub of expiredToday) {
        const subscriber = sub.subscriber as any;
        const pkg = sub.package as any;
        if (!subscriber?.phone) continue;

        const message = this.whatsappService.renderTemplate(
          settings.expiryTemplate,
          {
            name: subscriber.name ?? '',
            phone: subscriber.phone ?? '',
            endDate: this.formatDate(sub.endDate),
            package: pkg?.name ?? '',
          },
        );

        const sent = await this.whatsappService.sendMessage(
          subscriber.phone,
          message,
        );
        this.logger.log(
          `Expiry notification to ${subscriber.name} (${subscriber.phone}): ${sent ? 'sent' : 'failed'}`,
        );
      }
    }

    // ── Expiry warning (N days from now) ──────────────────────────────────────
    if (settings.expiryWarningEnabled) {
      const warningDate = new Date(today);
      warningDate.setDate(warningDate.getDate() + settings.warningDays);
      const warningDateEnd = new Date(warningDate);
      warningDateEnd.setHours(23, 59, 59, 999);
      warningDate.setHours(0, 0, 0, 0);

      const expiringSoon = await this.subscriptionsRepository.find({
        where: {
          endDate: Between(warningDate as any, warningDateEnd as any) as any,
          status: 'active',
        },
        relations: ['subscriber', 'package'],
      });

      for (const sub of expiringSoon) {
        const subscriber = sub.subscriber as any;
        const pkg = sub.package as any;
        if (!subscriber?.phone) continue;

        const message = this.whatsappService.renderTemplate(
          settings.expiryWarningTemplate,
          {
            name: subscriber.name ?? '',
            phone: subscriber.phone ?? '',
            endDate: this.formatDate(sub.endDate),
            package: pkg?.name ?? '',
            days: settings.warningDays,
          },
        );

        const sent = await this.whatsappService.sendMessage(
          subscriber.phone,
          message,
        );
        this.logger.log(
          `Warning notification to ${subscriber.name} (${subscriber.phone}): ${sent ? 'sent' : 'failed'}`,
        );
      }
    }
  }

  // Manual trigger for testing or forced send
  async sendNowForDate(targetDate?: Date): Promise<{ sent: number; failed: number }> {
    const settings = await this.whatsappService.getSettings();
    const date = targetDate ?? new Date();
    date.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    let sent = 0;
    let failed = 0;

    // Expiring today
    if (settings.expiryEnabled) {
      const expiredToday = await this.subscriptionsRepository.find({
        where: { endDate: Between(date as any, dateEnd as any) as any, status: 'active' },
        relations: ['subscriber', 'package'],
      });

      for (const sub of expiredToday) {
        const subscriber = sub.subscriber as any;
        const pkg = sub.package as any;
        if (!subscriber?.phone) continue;
        const message = this.whatsappService.renderTemplate(
          settings.expiryTemplate,
          {
            name: subscriber.name ?? '',
            phone: subscriber.phone ?? '',
            endDate: this.formatDate(sub.endDate),
            package: pkg?.name ?? '',
          },
        );
        const ok = await this.whatsappService.sendMessage(subscriber.phone, message);
        ok ? sent++ : failed++;
      }
    }

    // Expiring in N days
    if (settings.expiryWarningEnabled) {
      const warningDate = new Date(date);
      warningDate.setDate(warningDate.getDate() + settings.warningDays);
      const warningDateEnd = new Date(warningDate);
      warningDateEnd.setHours(23, 59, 59, 999);
      warningDate.setHours(0, 0, 0, 0);

      const expiringSoon = await this.subscriptionsRepository.find({
        where: {
          endDate: Between(warningDate as any, warningDateEnd as any) as any,
          status: 'active',
        },
        relations: ['subscriber', 'package'],
      });

      for (const sub of expiringSoon) {
        const subscriber = sub.subscriber as any;
        const pkg = sub.package as any;
        if (!subscriber?.phone) continue;
        const message = this.whatsappService.renderTemplate(
          settings.expiryWarningTemplate,
          {
            name: subscriber.name ?? '',
            phone: subscriber.phone ?? '',
            endDate: this.formatDate(sub.endDate),
            package: pkg?.name ?? '',
            days: settings.warningDays,
          },
        );
        const ok = await this.whatsappService.sendMessage(subscriber.phone, message);
        ok ? sent++ : failed++;
      }
    }

    return { sent, failed };
  }

  async getExpiringSoon(days: number = 7): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    future.setHours(23, 59, 59, 999);

    const subs = await this.subscriptionsRepository.find({
      where: {
        endDate: Between(today as any, future as any) as any,
        status: 'active',
      },
      relations: ['subscriber', 'package'],
      order: { endDate: 'ASC' },
    });

    return subs.map((s) => ({
      id: s.id,
      subscriberName: (s.subscriber as any)?.name,
      subscriberPhone: (s.subscriber as any)?.phone,
      package: (s.package as any)?.name,
      endDate: s.endDate,
      daysLeft: Math.ceil(
        (new Date(s.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
