import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappSettings } from './entities/whatsapp-settings.entity';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { WhatsappInstallmentsSettings } from './entities/whatsapp-installments-settings.entity';
import { WhatsappSupportSettings } from './entities/whatsapp-support-settings.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { Router } from '../routers/entities/router.entity';
import { RoutersModule } from '../routers/routers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappSettings, WhatsappLog, WhatsappInstallmentsSettings, WhatsappSupportSettings, Subscription, Subscriber, Router]),
    RoutersModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, NotificationSchedulerService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
