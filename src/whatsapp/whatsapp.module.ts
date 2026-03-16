import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappSettings } from './entities/whatsapp-settings.entity';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappSettings, WhatsappLog, Subscription])],
  controllers: [WhatsappController],
  providers: [WhatsappService, NotificationSchedulerService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
