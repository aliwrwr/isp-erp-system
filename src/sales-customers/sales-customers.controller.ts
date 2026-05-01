import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SalesCustomersService } from './sales-customers.service';
import { CreateSalesCustomerDto } from './dto/create-sales-customer.dto';
import { UpdateSalesCustomerDto } from './dto/update-sales-customer.dto';

@ApiTags('Sales Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales-customers')
export class SalesCustomersController {
  constructor(private readonly service: SalesCustomersService) {}

  @Post()
  @Roles('Super Admin', 'Sales Staff')
  @Permissions('sales.customers', 'sales.pos', 'sales.invoices')
  create(@Body() dto: CreateSalesCustomerDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  @Permissions('sales.customers', 'sales.pos', 'sales.invoices')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  @Permissions('sales.customers', 'sales.pos', 'sales.invoices')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sales Staff')
  @Permissions('sales.customers', 'sales.pos')
  update(@Param('id') id: string, @Body() dto: UpdateSalesCustomerDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  @Permissions('sales.customers')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Get(':id/invoices')
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  @Permissions('sales.customers', 'sales.pos', 'sales.invoices')
  getInvoices(@Param('id') id: string) {
    return this.service.getInvoices(+id);
  }

  @Post(':id/payment')
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  @Permissions('sales.customers', 'sales.pos')
  recordPayment(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.service.recordPayment(+id, Number(body.amount));
  }

  @Post(':id/charge')
  @Roles('Super Admin', 'Sales Staff')
  @Permissions('sales.customers', 'sales.pos')
  addCharge(@Param('id') id: string, @Body() body: { amount: number; note?: string }) {
    return this.service.addCharge(+id, Number(body.amount), body.note || '');
  }
}
