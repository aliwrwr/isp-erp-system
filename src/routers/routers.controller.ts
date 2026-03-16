import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoutersService } from './routers.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Routers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routers')
export class RoutersController {
  constructor(private readonly routersService: RoutersService) {}

  @Post()
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  create(@Body() createRouterDto: CreateRouterDto) {
    return this.routersService.create(createRouterDto);
  }

  @Get()
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  findAll() {
    return this.routersService.findAll();
  }

  @Get(':id')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  findOne(@Param('id') id: string) {
    return this.routersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  update(@Param('id') id: string, @Body() updateRouterDto: UpdateRouterDto) {
    return this.routersService.update(+id, updateRouterDto);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  remove(@Param('id') id: string) {
    return this.routersService.remove(+id);
  }
}
