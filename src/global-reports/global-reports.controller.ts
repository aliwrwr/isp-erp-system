import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GlobalReportsService } from './global-reports.service';

@UseGuards(JwtAuthGuard)
@Controller('global-reports')
export class GlobalReportsController {
  constructor(private readonly globalReportsService: GlobalReportsService) {}

  @Get('dashboard')
  async getDashboardData(@Query('period') period?: string, @Query('system') system?: string) {
    return this.globalReportsService.getDashboardData(period || 'month', system);
  }
}
