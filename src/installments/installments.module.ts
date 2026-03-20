import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentCustomer } from './entities/installment-customer.entity';
import { InstallmentContract } from './entities/installment-contract.entity';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [TypeOrmModule.forFeature([InstallmentCustomer, InstallmentContract, InstallmentPayment]), WhatsappModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
})
export class InstallmentsModule {}
