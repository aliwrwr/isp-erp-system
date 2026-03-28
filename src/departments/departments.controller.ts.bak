import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('Super Admin')
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  async findAll(@Request() req) {
    const user = req.user;
    // Super Admin sees all departments
    if (user.isSuperAdmin) {
      return this.departmentsService.findAll();
    }
    // Check if user has hr.departments permission
    if (!user.permissions?.includes('hr.departments')) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول إلى بيانات الأقسام');
    }
    // User with hr.departments permission sees ALL departments
    return this.departmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    if (user.isSuperAdmin) {
      return this.departmentsService.findOne(+id);
    }
    if (!user.permissions?.includes('hr.departments')) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول إلى بيانات الأقسام');
    }
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles('Super Admin')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
