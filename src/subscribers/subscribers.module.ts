import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Package } from '../packages/entities/package.entity';
import { Router } from '../routers/entities/router.entity';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { RoutersModule } from '../routers/routers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber, Subscription, Package, Router]), WhatsappModule, RoutersModule],
  controllers: [SubscribersController],
  providers: [SubscribersService],
  exports: [SubscribersService, TypeOrmModule],
})
export class SubscribersModule {}
