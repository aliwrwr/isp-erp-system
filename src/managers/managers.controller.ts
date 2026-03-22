import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Managers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  @Permissions('internet.managers')
  create(@Body() dto: CreateManagerDto) {
    return this.managersService.create(dto);
  }

  // Read-only: any authenticated user can list/view managers (needed for dropdowns)
  @Get()
  findAll() {
    return this.managersService.findAll();
  }

  @Get('by-username/:username')
  findByUsername(@Param('username') username: string) {
    return this.managersService.findByUsername(username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('internet.managers')
  update(@Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.managersService.update(+id, dto);
  }

  @Delete(':id')
  @Permissions('internet.managers')
  remove(@Param('id') id: string) {
    return this.managersService.remove(+id);
  }
}
