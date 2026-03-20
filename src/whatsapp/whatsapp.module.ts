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

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappSettings, WhatsappLog, WhatsappInstallmentsSettings, WhatsappSupportSettings, Subscription])],
  controllers: [WhatsappController],
  providers: [WhatsappService, NotificationSchedulerService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
