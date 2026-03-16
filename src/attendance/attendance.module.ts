import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancesController } from './attendance.controller';
import { AttendancesService } from './attendance.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), EmployeesModule],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendanceModule {}
