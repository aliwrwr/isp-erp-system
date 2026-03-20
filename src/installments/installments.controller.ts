import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InstallmentsService } from './installments.service';

@UseGuards(JwtAuthGuard)
@Controller('installments')
export class InstallmentsController {
  constructor(private readonly svc: InstallmentsService) {}

  // Dashboard
  @Get('dashboard') dashboard() { return this.svc.getDashboard(); }

  // Customers
  @Get('customers')             findCustomers(@Query('search') s?: string)      { return this.svc.findAllCustomers(s); }
  @Get('customers/:id')         findOneCustomer(@Param('id') id: string)         { return this.svc.findOneCustomer(+id); }
  @Post('customers')            createCustomer(@Body() dto: any)                 { return this.svc.createCustomer(dto); }
  @Patch('customers/:id')       updateCustomer(@Param('id') id: string, @Body() dto: any) { return this.svc.updateCustomer(+id, dto); }
  @Delete('customers/:id')      removeCustomer(@Param('id') id: string)          { return this.svc.removeCustomer(+id); }

  // Contracts
  @Get('contracts')             findContracts(@Query('status') s?: string, @Query('search') q?: string) { return this.svc.findAllContracts(s, q); }
  @Get('contracts/:id')         findOneContract(@Param('id') id: string)         { return this.svc.findOneContract(+id); }
  @Post('contracts')            createContract(@Body() dto: any)                 { return this.svc.createContract(dto); }
  @Patch('contracts/:id')       updateContract(@Param('id') id: string, @Body() dto: any) { return this.svc.updateContract(+id, dto); }
  @Delete('contracts/:id')      removeContract(@Param('id') id: string)          { return this.svc.removeContract(+id); }

  // Payments
  @Get('payments')                  getAllPayments(@Query('from') from?: string, @Query('to') to?: string) { return this.svc.getAllPayments(from, to); }
  @Get('contracts/:id/payments')    getPayments(@Param('id') id: string)        { return this.svc.findPaymentsByContract(+id); }
  @Post('contracts/:id/payments')   addPayment(@Param('id') id: string, @Body() dto: any) { return this.svc.addPayment(+id, dto); }
  @Delete('contracts/:contractId/payments/:id') removePayment(@Param('id') id: string) { return this.svc.removePayment(+id); }

  // Reports
  @Get('reports') getReports(@Query('from') from?: string, @Query('to') to?: string) { return this.svc.getReports(from, to); }
}
