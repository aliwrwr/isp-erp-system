import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles('Super Admin', 'Accountant')
  @Permissions('internet.subscriptions')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @Roles('Super Admin', 'Accountant', 'Network Admin')
  @Permissions('internet.subscriptions')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @Roles('Super Admin', 'Accountant', 'Network Admin')
  @Permissions('internet.subscriptions')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Accountant')
  @Permissions('internet.subscriptions')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Patch(':id/pay')
  @Roles('Super Admin', 'Accountant')
  @Permissions('internet.subscriptions')
  pay(@Param('id') id: string, @Body() body: { amount: number; notes?: string }) {
    return this.subscriptionsService.pay(+id, Number(body.amount), body.notes);
  }

  @Patch(':id/debt')
  @Roles('Super Admin', 'Accountant')
  @Permissions('internet.subscriptions')
  addDebt(@Param('id') id: string, @Body() body: { amount: number; notes?: string }) {
    return this.subscriptionsService.addDebt(+id, Number(body.amount), body.notes);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Accountant')
  @Permissions('internet.subscriptions')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
