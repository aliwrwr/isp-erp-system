import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CashboxService } from './cashbox.service';

@UseGuards(JwtAuthGuard)
@Controller('cashbox')
export class CashboxController {
  constructor(private readonly service: CashboxService) {}

  @Get('summary')
  summary() {
    return this.service.summary();
  }

  @Get('ledger')
  ledger(
    @Query('search')   search?: string,
    @Query('type')     type?: string,
    @Query('source')   source?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo')   dateTo?: string,
    @Query('page')     page?: string,
    @Query('limit')    limit?: string,
  ) {
    return this.service.ledger({
      search, type, source, dateFrom, dateTo,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Post('manual')
  createManual(@Body() dto: any) {
    return this.service.createManual(dto);
  }

  @Delete('manual/:id')
  removeManual(@Param('id') id: string) {
    return this.service.removeManual(+id);
  }
}
