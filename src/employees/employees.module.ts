import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), UsersModule], // Add UsersModule here
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
