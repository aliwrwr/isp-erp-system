import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesCustomer } from './entities/sales-customer.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { SalesCustomersService } from './sales-customers.service';
import { SalesCustomersController } from './sales-customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SalesCustomer, Invoice])],
  controllers: [SalesCustomersController],
  providers: [SalesCustomersService],
})
export class SalesCustomersModule {}
