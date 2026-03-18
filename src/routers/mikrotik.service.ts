import { Injectable, Logger } from '@nestjs/common';
import { RouterOSAPI } from 'node-routeros';

export interface RouterStatus {
  online: boolean;
  identity?: string;
  version?: string;
  uptime?: string;
  cpuLoad?: number;
  freeMemory?: number;
  totalMemory?: number;
  freeHdd?: number;
  totalHdd?: number;
  board?: string;
  serialNumber?: string;
  error?: string;
}

export interface RouterInterface {
  name: string;
  type: string;
  macAddress: string;
  running: boolean;
  disabled: boolean;
  txBps: number;
  rxBps: number;
  txPackets: number;
  rxPackets: number;
  comment?: string;
}

export interface ActiveConnection {
  id: string;
  name: string;
  service: string;
  address: string;
  uptime: string;
  rxBytes: number;
  txBytes: number;
  encoding?: string;
  comment?: string;
}

@Injectable()
export class MikrotikService {
  private readonly logger = new Logger(MikrotikService.name);

  private createConnection(
    host: string,
    username: string,
    password: string,
    port = 8728,
    isSsl = false,
  ): RouterOSAPI {
    return new RouterOSAPI({
      host,
      user: username,
      password,
      port,
      tls: isSsl,
      keepalive: false,
      timeout: 8,
    } as any);
  }

  async ping(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): Promise<boolean> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();
      conn.close();
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): Promise<RouterStatus> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();

      const [identityRes, resourceRes, boardRes] = await Promise.all([
        conn.write('/system/identity/print'),
        conn.write('/system/resource/print'),
        conn.write('/system/routerboard/print').catch(() => [{}]),
      ]);

      conn.close();

      const identity = identityRes[0] as any;
      const res = resourceRes[0] as any;
      const board = boardRes[0] as any;

      const parseBytes = (val: string | number) => parseInt(String(val)) || 0;

      return {
        online: true,
        identity: identity?.name || '',
        version: res?.version || '',
        uptime: res?.uptime || '',
        cpuLoad: parseInt(res?.['cpu-load']) || 0,
        freeMemory: parseBytes(res?.['free-memory']),
        totalMemory: parseBytes(res?.['total-memory']),
        freeHdd: parseBytes(res?.['free-hdd-space']),
        totalHdd: parseBytes(res?.['total-hdd-space']),
        board: board?.model || res?.['board-name'] || '',
        serialNumber: board?.['serial-number'] || '',
      };
    } catch (err: any) {
      this.logger.warn(`MikroTik ping failed for ${router.ipAddress}: ${err.message}`);
      return { online: false, error: err.message };
    }
  }

  async getInterfaces(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): Promise<RouterInterface[]> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();

      const [intfList, stats] = await Promise.all([
        conn.write('/interface/print'),
        conn.write('/interface/print', ['=stats=']).catch(() => []),
      ]);

      conn.close();

      // Merge stats into interface list
      const statsMap: Record<string, any> = {};
      (stats as any[]).forEach((s: any) => { if (s.name) statsMap[s.name] = s; });

      return (intfList as any[]).map((i: any) => {
        const s = statsMap[i.name] || {};
        return {
          name: i.name,
          type: i.type || 'ether',
          macAddress: i['mac-address'] || '',
          running: i.running === 'true',
          disabled: i.disabled === 'true',
          txBps: parseInt(s['tx-bits-per-second']) || 0,
          rxBps: parseInt(s['rx-bits-per-second']) || 0,
          txPackets: parseInt(s['tx-packet']) || 0,
          rxPackets: parseInt(s['rx-packet']) || 0,
          comment: i.comment || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`getInterfaces failed for ${router.ipAddress}: ${err.message}`);
      return [];
    }
  }

  async getActiveConnections(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): Promise<ActiveConnection[]> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();

      // Try PPPoE active sessions first
      const pppoe = await conn.write('/ppp/active/print').catch(() => []);

      conn.close();

      return (pppoe as any[]).map((s: any) => ({
        id: s['.id'] || '',
        name: s.name || '',
        service: s.service || 'pppoe',
        address: s.address || s['caller-id'] || '',
        uptime: s.uptime || '',
        rxBytes: parseInt(s['bytes-in']) || 0,
        txBytes: parseInt(s['bytes-out']) || 0,
        encoding: s.encoding || '',
        comment: s.comment || '',
      }));
    } catch (err: any) {
      this.logger.warn(`getActiveConnections failed for ${router.ipAddress}: ${err.message}`);
      return [];
    }
  }

  async getIpAddresses(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): Promise<any[]> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();
      const result = await conn.write('/ip/address/print');
      conn.close();

      return (result as any[]).map((a: any) => ({
        id: a['.id'],
        address: a.address,
        network: a.network,
        interface: a.interface,
        disabled: a.disabled === 'true',
        comment: a.comment || '',
      }));
    } catch (err: any) {
      return [];
    }
  }
}
