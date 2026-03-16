import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from './entities/salary.entity';
import { SalariesController } from './salaries.controller';
import { SalariesService } from './salaries.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Salary]), EmployeesModule],
  controllers: [SalariesController],
  providers: [SalariesService],
})
export class SalariesModule {}
