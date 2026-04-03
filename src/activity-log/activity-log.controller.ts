import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @Roles('admin', 'manager', 'employee')
  create(@Body() logData: any, @Req() req) {
    return this.activityLogService.create(logData, req.user);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll() {
    return this.activityLogService.findAll();
  }
}
