import { Module } from '@nestjs/common';
import { GlobalReportsController } from './global-reports.controller';
import { GlobalReportsService } from './global-reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [], // We'll just run raw queries using the main connection
  controllers: [GlobalReportsController],
  providers: [GlobalReportsService],
})
export class GlobalReportsModule {}
