import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ProductsModule } from '../products/products.module';
import { SalesCustomer } from '../sales-customers/entities/sales-customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, SalesCustomer]), ProductsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
