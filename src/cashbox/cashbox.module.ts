import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashboxManual } from './entities/cashbox-manual.entity';
import { CashboxController } from './cashbox.controller';
import { CashboxService } from './cashbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([CashboxManual])],
  controllers: [CashboxController],
  providers: [CashboxService],
})
export class CashboxModule {}
