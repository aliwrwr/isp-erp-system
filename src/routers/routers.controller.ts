import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutersService } from './routers.service';
import { MikrotikService } from './mikrotik.service';
import { CreateRouterDto } from './dto/create-router.dto';
import { UpdateRouterDto } from './dto/update-router.dto';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
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
    @InjectRepository(Subscriber) private subscriberRepo: Repository<Subscriber>,
  ) {}

  // ── Debug: raw PPPoE active fields from first router ───────────────────────
  @Get('debug-connections')
  @Roles('Super Admin', 'Network Admin')
  async debugConnections() {
    const routers = await this.routersService.findAll();
    if (!routers.length) return { error: 'no routers' };
    const router = routers[0];
    const conns = await this.mikrotikService.getActiveConnections(router);
    return { first: conns[0] ?? null, count: conns.length };
  }

  // ── All active connections (aggregated from all routers) ─────────────────────
  @Get('connections')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.connected')
  async getAllConnections() {
    const routers = await this.routersService.findAll();
    const subscribers = await this.subscriberRepo.find({ relations: ['package'] });
    const subMap = new Map(subscribers.map(s => [s.username.toLowerCase(), s]));

    const results: any[] = [];
    await Promise.allSettled(
      routers.map(async (router) => {
        try {
          const conns = await this.mikrotikService.getActiveConnections(router);
          for (const conn of conns) {
            const sub = subMap.get(conn.name.toLowerCase());
            const connStatus = !sub ? 'unknown' : sub.status === 'active' ? 'active' : 'disabled';
            results.push({
              ...conn,
              routerId: router.id,
              routerName: router.name,
              subscriberId: sub?.id ?? null,
              subscriberName: sub?.name ?? '',
              packageName: sub?.package?.name ?? '',
              subscriberStatus: connStatus,
            });
          }
        } catch (_) {}
      }),
    );
    return results;
  }

  // ── Single connection stats (fast poll) ──────────────────────────────────────
  @Get(':id/connection/:username')
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.connected')
  async getConnectionStats(
    @Param('id') id: string,
    @Param('username') username: string,
  ) {
    const router = await this.routersService.findOne(+id);
    if (!router) return null;
    return this.mikrotikService.getConnectionByUsername(router, username);
  }

  // ── Disconnect a PPPoE session ────────────────────────────────────────────────
  @Post(':id/disconnect-session')
  @HttpCode(200)
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.connected')
  async disconnectSession(
    @Param('id') id: string,
    @Body() body: { sessionId: string },
  ) {
    const router = await this.routersService.findOne(+id);
    if (!router) return { success: false, message: 'Router not found' };
    const ok = await this.mikrotikService.disconnectPppSession(router, body.sessionId);
    return { success: ok, message: ok ? 'تم قطع الاتصال' : 'فشل قطع الاتصال' };
  }

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

  @Post(':id/ping-host')
  @HttpCode(200)
  @Roles('Super Admin', 'Network Admin')
  @Permissions('internet.connected')
  async pingHost(@Param('id') id: string, @Body() body: { host: string }) {
    const router = await this.routersService.findOne(+id);
    if (!router) return { success: false, results: [] };
    const results = await this.mikrotikService.pingHost(router, body.host);
    return { success: true, results };
  }
}
