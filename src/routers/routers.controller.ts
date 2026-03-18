import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { RoutersService } from './routers.service';
import { MikrotikService } from './mikrotik.service';
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
  constructor(
    private readonly routersService: RoutersService,
    private readonly mikrotikService: MikrotikService,
  ) {}

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

  // ── MikroTik Live Data Endpoints ──────────────────────────────────

  @Get(':id/status')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  async getStatus(@Param('id') id: string) {
    const router = await this.routersService.findOne(+id);
    if (!router) return { online: false, error: 'Router not found' };
    return this.mikrotikService.getStatus(router);
  }

  @Get(':id/interfaces')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  async getInterfaces(@Param('id') id: string) {
    const router = await this.routersService.findOne(+id);
    if (!router) return [];
    return this.mikrotikService.getInterfaces(router);
  }

  @Get(':id/active-connections')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  async getActiveConnections(@Param('id') id: string) {
    const router = await this.routersService.findOne(+id);
    if (!router) return [];
    return this.mikrotikService.getActiveConnections(router);
  }

  @Get(':id/ip-addresses')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  async getIpAddresses(@Param('id') id: string) {
    const router = await this.routersService.findOne(+id);
    if (!router) return [];
    return this.mikrotikService.getIpAddresses(router);
  }

  @Post(':id/ping')
  @HttpCode(200)
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.routers')
  async ping(@Param('id') id: string) {
    const router = await this.routersService.findOne(+id);
    if (!router) return { online: false };
    const online = await this.mikrotikService.ping(router);
    return { online };
  }
}
