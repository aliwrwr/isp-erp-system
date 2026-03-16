import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './entities/router.entity';
import { RoutersController } from './routers.controller';
import { RoutersService } from './routers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Router])],
  controllers: [RoutersController],
  providers: [RoutersService],
})
export class RoutersModule {}
