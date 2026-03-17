import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  create(@Body() dto: CreateSalesCustomerDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Super Admin', 'Sales Staff', 'Accountant')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sales Staff')
  update(@Param('id') id: string, @Body() dto: UpdateSalesCustomerDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
