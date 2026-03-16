import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Salaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salaries')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  @Post()
  @Roles('Super Admin')
  @Permissions('hr.salaries')
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salariesService.create(createSalaryDto);
  }

  @Get()
  @Roles('Super Admin')
  @Permissions('hr.salaries')
  findAll() {
    return this.salariesService.findAll();
  }

  @Get(':id')
  @Roles('Super Admin')
  @Permissions('hr.salaries')
  findOne(@Param('id') id: string) {
    return this.salariesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin')
  @Permissions('hr.salaries')
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salariesService.update(+id, updateSalaryDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id') id: string) {
    return this.salariesService.remove(+id);
  }
}
