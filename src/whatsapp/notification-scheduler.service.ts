import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { Router } from '../routers/entities/router.entity';
import { WhatsappService } from './whatsapp.service';
import { MikrotikService } from '../routers/mikrotik.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Subscriber)
    private subscriberRepository: Repository<Subscriber>,
    @InjectRepository(Router)
    private routerRepository: Repository<Router>,
    private whatsappService: WhatsappService,
    @Optional() private readonly mikrotikService: MikrotikService,
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

  /**
   * Runs every minute.
   * Finds all active subscriptions whose endDate has passed (exact datetime),
   * marks them expired, then disables the subscriber on MikroTik and kicks active sessions.
   */
  @Cron('* * * * *')
  async autoExpireSubscriptions(): Promise<void> {
    const now = new Date();

    // Find all subscriptions whose exact endDate has passed and are still 'active'
    const expired = await this.subscriptionsRepository.find({
      where: { endDate: LessThan(now as any) as any, status: 'active' },
      relations: ['subscriber', 'subscriber.router'],
    });

    if (expired.length === 0) return;

    if (expired.length === 0) return;

    const processedSubscribers = new Set<number>();

    for (const sub of expired) {
      // Mark subscription as expired
      await this.subscriptionsRepository.update(sub.id, { status: 'expired' }).catch(() => {});

      const subscriber = sub.subscriber as any;
      if (!subscriber?.id || processedSubscribers.has(subscriber.id)) continue;
      processedSubscribers.add(subscriber.id);

      // Disable subscriber in DB
      await this.subscriberRepository.update(subscriber.id, { isEnabled: false } as any).catch(() => {});
      this.logger.log(`Auto-expire: disabled subscriber ${subscriber.name} (id=${subscriber.id}) at ${new Date().toISOString()}`);

      // Disable on MikroTik + kick active session
      if (this.mikrotikService && subscriber.router) {
        const router = subscriber.router;
        await this.mikrotikService.setPppoeSecretEnabled(router, subscriber.username, false).catch(() => {});
        await this.mikrotikService.disconnectByUsername(router, subscriber.username).catch(() => {});
      }
    }
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
