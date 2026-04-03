import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Package } from '../packages/entities/package.entity';
import { Router } from '../routers/entities/router.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MikrotikService } from '../routers/mikrotik.service';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
    @InjectRepository(Router)
    private routerRepository: Repository<Router>,
    @Optional() private readonly whatsappService: WhatsappService,
    @Optional() private readonly mikrotikService: MikrotikService,
  ) {}

  /** Sync a PPPoE secret to MikroTik. Creates it if missing, updates if exists, disables if isEnabled=false. */
  private async syncPppoe(
    router: Router,
    sub: { username: string; password: string; isEnabled: boolean; package?: any },
    action: 'create' | 'enable' | 'disable' | 'delete',
  ): Promise<void> {
    if (!this.mikrotikService) return;
    const profile = sub.package?.routerProfile || undefined;
    try {
      if (action === 'create') {
        await this.mikrotikService.createPppoeSecret(router, {
          name: sub.username,
          password: sub.password,
          profile,
          comment: 'ISP-ERP',
        });
        if (!sub.isEnabled) {
          await this.mikrotikService.setPppoeSecretEnabled(router, sub.username, false);
        }
      } else if (action === 'enable') {
        // Try enable; if secret doesn't exist yet, create it
        const ok = await this.mikrotikService.setPppoeSecretEnabled(router, sub.username, true);
        if (!ok) {
          await this.mikrotikService.createPppoeSecret(router, {
            name: sub.username,
            password: sub.password,
            profile,
            comment: 'ISP-ERP',
          });
        }
      } else if (action === 'disable') {
        await this.mikrotikService.setPppoeSecretEnabled(router, sub.username, false);
        // Kick active sessions so the subscriber is disconnected immediately
        await this.mikrotikService.disconnectByUsername(router, sub.username).catch(() => {});
      } else if (action === 'delete') {
        await this.mikrotikService.deletePppoeSecret(router, sub.username);
      }
    } catch (_) { /* never throw — MikroTik errors must not break the ERP */ }
  }

  async create(createSubscriberDto: CreateSubscriberDto): Promise<Subscriber> {
    const { packageId, managerId, routerId, subStartDate, subEndDate, paymentMethod: pmCreate, partialAmount: paCreate, ...rest } = createSubscriberDto as any;
    const subscriber = this.subscribersRepository.create({
      ...rest,
      status: 'active',
      // Use provided password or fall back to username
      password: rest.password?.trim() || rest.username,
      ...(packageId ? { package: { id: packageId } } : {}),
      ...(managerId ? { manager: { id: managerId } } : {}),
      ...(routerId ? { router: { id: routerId } } : {}),
    });
    const saved = await (this.subscribersRepository.save(subscriber) as unknown as Promise<Subscriber>);

    // Sync PPPoE secret to MikroTik
    if (routerId && this.mikrotikService) {
      const router = await this.routerRepository.findOne({ where: { id: routerId } });
      const pkg = packageId ? await this.packagesRepository.findOne({ where: { id: packageId } }) : null;
      if (router) {
        await this.syncPppoe(router, {
          username: saved.username,
          password: (saved as any).password,
          isEnabled: (saved as any).isEnabled !== false,
          package: pkg,
        }, 'create');
      }
    }

    // Auto-create subscription if startDate is provided
    if (subStartDate && packageId) {
      const pkg = await this.packagesRepository.findOne({ where: { id: packageId } });
      // Preserve full datetime (time-of-day) so expiry fires at exact creation time
      const startDt = new Date(subStartDate);
      let endDate = subEndDate ? new Date(subEndDate) : null;
      if (!endDate && pkg?.duration) {
        endDate = new Date(startDt.getTime()); // copy exact time
        endDate.setDate(endDate.getDate() + pkg.duration);
      }
      if (endDate) {
        const createPm = pmCreate || 'cash';
        const createPaid = createPm === 'partial' ? Number(paCreate || 0) : (createPm === 'cash' ? Number(pkg?.price || 0) : 0);
        const subscription = this.subscriptionsRepository.create({
          subscriber: { id: saved.id } as any,
          package: { id: packageId } as any,
          startDate: startDt,
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
    return this.subscribersRepository.find({ relations: ['manager', 'package', 'subscriptions', 'router'] });
  }

  findOne(id: number): Promise<Subscriber | null> {
    return this.subscribersRepository.findOne({ where: { id }, relations: ['manager', 'package', 'subscriptions', 'router'] });
  }

  async update(id: number, updateSubscriberDto: UpdateSubscriberDto): Promise<Subscriber | null> {
    const { packageId, managerId, routerId, subStartDate, subEndDate, paymentMethod, partialAmount, ...rest } = updateSubscriberDto as any;

    // Load current subscriber before update (for PPPoE comparison)
    const before = await this.subscribersRepository.findOne({ where: { id }, relations: ['router', 'package'] });

    await this.subscribersRepository.update(id, {
      ...rest,
      ...(packageId !== undefined ? { package: { id: packageId } } : {}),
      ...(managerId !== undefined ? { manager: { id: managerId } } : {}),
      ...(routerId !== undefined ? { router: routerId ? { id: routerId } : null } : {}),
    });

    // ── MikroTik PPPoE sync ─────────────────────────────────────────
    if (this.mikrotikService) {
      const after = await this.subscribersRepository.findOne({ where: { id }, relations: ['router', 'package'] });
      const router = after?.router ?? before?.router;
      if (router) {
        // isEnabled toggled
        if (rest.isEnabled !== undefined) {
          await this.syncPppoe(router, {
            username: after?.username ?? before?.username ?? '',
            password: after?.password ?? before?.password ?? '',
            isEnabled: rest.isEnabled,
            package: after?.package ?? before?.package,
          }, rest.isEnabled ? 'enable' : 'disable');
        }
        // password or profile changed
        const passwordChanged = rest.password && rest.password !== before?.password;
        const profileChanged = packageId && (after?.package?.routerProfile !== before?.package?.routerProfile);
        if (passwordChanged || profileChanged) {
          await this.mikrotikService.updatePppoeSecret(router, before?.username ?? '', {
            password: passwordChanged ? rest.password : undefined,
            profile: profileChanged ? (after?.package?.routerProfile ?? undefined) : undefined,
          }).catch(() => {});
        }
      }
    }

    // Auto-create subscription on package change if startDate provided
    let activationNotificationSent = false;
    if (subStartDate && packageId) {
      const pkg = await this.packagesRepository.findOne({ where: { id: packageId } });
      // Preserve full datetime (time-of-day) so expiry fires at exact creation time
      const startDt = new Date(subStartDate);
      let endDate = subEndDate ? new Date(subEndDate) : null;
      if (!endDate && pkg?.duration) {
        endDate = new Date(startDt.getTime()); // copy exact time
        endDate.setDate(endDate.getDate() + pkg.duration);
      }
      if (endDate) {
        const paymentMethod = (updateSubscriberDto as any).paymentMethod || 'cash';
        const paidAmt = paymentMethod === 'partial' ? Number(partialAmount || 0) : (paymentMethod === 'cash' ? Number(pkg?.price || 0) : 0);
        const subscription = this.subscriptionsRepository.create({
          subscriber: { id } as any,
          package: { id: packageId } as any,
          startDate: startDt,
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

    // Log status changes
    if (before && rest.status && before.status !== rest.status) {
      if (rest.status === 'active') {
        // This is handled by the subscription activation logic, but we can add a log here if needed
      } else if (rest.status === 'suspended') {
        // This is where you would log a suspension
      }
    }

    return this.findOne(id);
  }

  async suspend(id: number): Promise<Subscriber | null> {
    await this.subscribersRepository.update(id, { status: 'suspended' });
    const sub = await this.findOne(id);
    if (sub?.router && this.mikrotikService) {
      await this.syncPppoe(sub.router, {
        username: sub.username,
        password: (sub as any).password,
        isEnabled: false,
        package: (sub as any).package,
      }, 'disable');
    }
    return sub;
  }

  async activate(id: number): Promise<Subscriber | null> {
    await this.subscribersRepository.update(id, { status: 'active' });
    const sub = await this.findOne(id);
    if (sub?.router && this.mikrotikService) {
      await this.syncPppoe(sub.router, {
        username: sub.username,
        password: (sub as any).password,
        isEnabled: true,
        package: (sub as any).package,
      }, 'enable');
    }
    // Also send whatsapp notification on manual activation
    if (this.whatsappService && sub) {
      const activeSubscription = (sub as any).subscriptions?.find((s: any) => s.status === 'active');
      this.whatsappService.sendActivationNotification(
        sub.phone,
        sub.name,
        (sub as any).package?.name ?? '',
        activeSubscription?.endDate ?? null,
      ).catch(() => {});
    }
    return sub;
  }

  async remove(id: number): Promise<void> {
    // Delete PPPoE secret from MikroTik before removing subscriber
    const sub = await this.subscribersRepository.findOne({ where: { id }, relations: ['router'] });
    if (sub?.router && this.mikrotikService) {
      await this.syncPppoe(sub.router, {
        username: sub.username,
        password: (sub as any).password,
        isEnabled: false,
      }, 'delete');
    }
    await this.subscriptionsRepository.delete({ subscriber: { id } });
    await this.subscribersRepository.delete(id);
  }

  /**
   * Force-sync subscriber PPPoE secret to MikroTik.
   * Deletes old secret (if username changed) then recreates with current data.
   * Safe to call multiple times (idempotent).
   */
  async syncToRouter(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.mikrotikService) return { success: false, message: 'خدمة المايكروتك غير مفعلة' };
    const sub = await this.subscribersRepository.findOne({ where: { id }, relations: ['router', 'package'] });
    if (!sub) return { success: false, message: 'المشترك غير موجود' };
    if (!sub.router) return { success: false, message: 'لم يتم تحديد راوتر لهذا المشترك' };

    const router = sub.router;
    const profile = (sub as any).package?.routerProfile || undefined;
    const password = (sub as any).password || sub.username;
    const isEnabled = (sub as any).isEnabled !== false;

    try {
      // Remove old secret if exists, then recreate fresh
      await this.mikrotikService.deletePppoeSecret(router, sub.username);
      await this.mikrotikService.createPppoeSecret(router, {
        name: sub.username,
        password,
        profile,
        comment: 'ISP-ERP',
      });
      if (!isEnabled) {
        await this.mikrotikService.setPppoeSecretEnabled(router, sub.username, false);
      }
      return { success: true, message: `تمت المزامنة بنجاح مع ${router.name}` };
    } catch (err: any) {
      return { success: false, message: `فشل الاتصال بالراوتر: ${err.message}` };
    }
  }
}
