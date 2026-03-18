import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './entities/router.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { RoutersController } from './routers.controller';
import { RoutersService } from './routers.service';
import { MikrotikService } from './mikrotik.service';

@Module({
  imports: [TypeOrmModule.forFeature([Router, Subscriber])],
  controllers: [RoutersController],
  providers: [RoutersService, MikrotikService],
  exports: [RoutersService, MikrotikService],
})
export class RoutersModule {}
