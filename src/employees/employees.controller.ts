import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('Super Admin')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    if (user.isSuperAdmin) {
      return this.employeesService.findAll();
    }
    // Allow hr.employees, support.tickets, and support.technicians to read employees list
    const allowedPerms = ['hr.employees', 'support.tickets', 'support.technicians'];
    const hasAccess = allowedPerms.some(p => user.permissions?.includes(p));
    if (!hasAccess) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول إلى بيانات الموظفين');
    }
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    if (user.isSuperAdmin) {
      return this.employeesService.findOne(+id);
    }
    const allowedPerms = ['hr.employees', 'support.tickets', 'support.technicians'];
    const hasAccess = allowedPerms.some(p => user.permissions?.includes(p));
    if (!hasAccess) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول إلى بيانات الموظفين');
    }
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
