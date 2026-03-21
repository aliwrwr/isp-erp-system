import { Injectable, Logger } from '@nestjs/common';
import { RouterOSAPI } from 'node-routeros';

export interface RouterStatus {
  online: boolean;
  identity?: string;
  version?: string;
  uptime?: string;
  cpu?: number;
  freeMemory?: number;
  totalMemory?: number;
  freeHdd?: number;
  totalHdd?: number;
  boardName?: string;
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
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
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
      tlsOptions: isSsl ? { rejectUnauthorized: false } : undefined,
      keepalive: false,
      timeout: 10,
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

  async pingHost(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }, host: string): Promise<{ seq: number; ttl: number; time: number; status: string }[]> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();
      const raw = await conn.write('/ping', [
        `=address=${host}`,
        '=count=4',
        '=interval=0.5',
      ]).catch(() => []);
      conn.close();
      return (raw as any[]).map((r: any, i: number) => ({
        seq: i + 1,
        ttl: parseInt(r.ttl) || 0,
        time: parseFloat(r.time?.replace('ms', '') || r['response-time']?.replace('ms', '') || '0'),
        status: r.status === 'timeout' ? 'timeout' : 'reply',
      }));
    } catch (err: any) {
      this.logger.warn(`pingHost failed: ${err.message}`);
      return [];
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
        cpu: parseInt(res?.['cpu-load']) || 0,
        freeMemory: parseBytes(res?.['free-memory']),
        totalMemory: parseBytes(res?.['total-memory']),
        freeHdd: parseBytes(res?.['free-hdd-space']),
        totalHdd: parseBytes(res?.['total-hdd-space']),
        boardName: board?.model || res?.['board-name'] || '',
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

      // Get active PPPoE sessions + interface stats in parallel
      const [pppoe, ifaceStats] = await Promise.all([
        conn.write('/ppp/active/print').catch(() => []),
        conn.write('/interface/print', ['=stats=']).catch(() => []),
      ]);

      conn.close();

      // Map interface name → stats  (PPPoE interfaces are named <pppoe-username>)
      const ifaceMap: Record<string, any> = {};
      (ifaceStats as any[]).forEach((i: any) => { if (i.name) ifaceMap[i.name] = i; });

      // Log raw first entry so we can see actual field names in PM2 logs
      if ((pppoe as any[]).length > 0) {
        this.logger.log('PPPoE RAW FIELDS: ' + JSON.stringify((pppoe as any[])[0]));
      }

      return (pppoe as any[]).map((s: any) => {
        const ifaceName = `<pppoe-${s.name}>`;
        const iface = ifaceMap[ifaceName] || {};
        return {
          id: s['.id'] || '',
          name: s.name || '',
          service: s.service || 'pppoe',
          address: s.address || '',
          macAddress: s['caller-id'] || '',
          uptime: s.uptime || '',
          bytesIn: parseInt(iface['tx-byte']) || 0,   // tx = router→client = download
          bytesOut: parseInt(iface['rx-byte']) || 0,  // rx = client→router = upload
          encoding: s.encoding || '',
          comment: s.comment || '',
          _raw: { session: s, iface },
        };
      });
    } catch (err: any) {
      this.logger.warn(`getActiveConnections failed for ${router.ipAddress}: ${err.message}`);
      return [];
    }
  }

  async getConnectionByUsername(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    username: string,
  ): Promise<{ bytesIn: number; bytesOut: number; uptime: string; address: string } | null> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    try {
      await conn.connect();
      const [pppoe, ifaceStats] = await Promise.all([
        conn.write('/ppp/active/print', [`?name=${username}`]).catch(() => []),
        conn.write('/interface/print', [`?name=<pppoe-${username}>`, '=stats=']).catch(() => []),
      ]);
      conn.close();
      const session = (pppoe as any[])[0];
      if (!session) return null;
      const iface = (ifaceStats as any[])[0] || {};
      return {
        bytesIn:  parseInt(iface['tx-byte']) || 0,
        bytesOut: parseInt(iface['rx-byte']) || 0,
        uptime:   session.uptime || '',
        address:  session.address || '',
      };
    } catch {
      return null;
    } finally {
      try { conn.close(); } catch {}
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

  async disconnectPppSession(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    sessionId: string,
  ): Promise<boolean> {
    const isSsl = router.connectionType === 'API-SSL';
    const conn = this.createConnection(
      router.ipAddress, router.username, router.password,
      router.port || (isSsl ? 8729 : 8728), isSsl,
    );
    try {
      await conn.connect();
      await conn.write('/ppp/active/remove', [`=.id=${sessionId}`]);
      conn.close();
      return true;
    } catch (err: any) {
      this.logger.warn(`disconnectPppSession failed: ${err.message}`);
      return false;
    }
  }

  // ── PPPoE Secret Management ──────────────────────────────────────────────────

  private routerConn(router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string }): RouterOSAPI {
    const isSsl = router.connectionType === 'API-SSL';
    return this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
  }

  /** Create a PPPoE secret. Returns true on success. */
  async createPppoeSecret(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    secret: { name: string; password: string; profile?: string; comment?: string },
  ): Promise<boolean> {
    const conn = this.routerConn(router);
    try {
      await conn.connect();
      const params = [
        `=name=${secret.name}`,
        `=password=${secret.password}`,
        `=service=pppoe`,
        `=disabled=no`,
      ];
      if (secret.profile) params.push(`=profile=${secret.profile}`);
      if (secret.comment) params.push(`=comment=${secret.comment}`);
      await conn.write('/ppp/secret/add', params);
      conn.close();
      this.logger.log(`PPPoE secret created: ${secret.name} on ${router.ipAddress}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`createPppoeSecret failed for ${secret.name}: ${err.message}`);
      conn.close();
      return false;
    }
  }

  /** Enable or disable a PPPoE secret by username. */
  async setPppoeSecretEnabled(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    name: string,
    enabled: boolean,
  ): Promise<boolean> {
    const conn = this.routerConn(router);
    try {
      await conn.connect();
      // Find the secret .id
      const secrets = await conn.write('/ppp/secret/print', [`?name=${name}`]) as any[];
      if (!secrets || secrets.length === 0) {
        conn.close();
        this.logger.warn(`setPppoeSecretEnabled: secret not found: ${name}`);
        return false;
      }
      const id = secrets[0]['.id'];
      await conn.write('/ppp/secret/set', [`=.id=${id}`, `=disabled=${enabled ? 'no' : 'yes'}`]);
      conn.close();
      this.logger.log(`PPPoE secret ${name} on ${router.ipAddress}: disabled=${!enabled}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`setPppoeSecretEnabled failed for ${name}: ${err.message}`);
      conn.close();
      return false;
    }
  }

  /** Update username, password and/or profile of a PPPoE secret. */
  async updatePppoeSecret(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    oldName: string,
    updates: { name?: string; password?: string; profile?: string },
  ): Promise<boolean> {
    const conn = this.routerConn(router);
    try {
      await conn.connect();
      const secrets = await conn.write('/ppp/secret/print', [`?name=${oldName}`]) as any[];
      if (!secrets || secrets.length === 0) {
        conn.close();
        this.logger.warn(`updatePppoeSecret: secret not found: ${oldName}`);
        return false;
      }
      const id = secrets[0]['.id'];
      const params: string[] = [`=.id=${id}`];
      if (updates.name)     params.push(`=name=${updates.name}`);
      if (updates.password) params.push(`=password=${updates.password}`);
      if (updates.profile)  params.push(`=profile=${updates.profile}`);
      await conn.write('/ppp/secret/set', params);
      conn.close();
      this.logger.log(`PPPoE secret updated: ${oldName} on ${router.ipAddress}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`updatePppoeSecret failed for ${oldName}: ${err.message}`);
      conn.close();
      return false;
    }
  }

  /**
   * Ensure a PPPoE profile exists on the router. Creates it if missing.
   * For the 'expired' profile: rate-limit 1k/1k (effectively zero usable speed).
   */
  async ensurePppoeProfile(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    profileName: string,
    rateLimit = '1k/1k',
  ): Promise<void> {
    const conn = this.routerConn(router);
    try {
      await conn.connect();
      const existing = await conn.write('/ppp/profile/print', [`?name=${profileName}`]) as any[];
      if (!existing || existing.length === 0) {
        await conn.write('/ppp/profile/add', [
          `=name=${profileName}`,
          `=rate-limit=${rateLimit}`,
          `=session-timeout=00:00:00`,
        ]);
        this.logger.log(`PPPoE profile '${profileName}' created on ${router.ipAddress}`);
      }
      conn.close();
    } catch (err: any) {
      this.logger.warn(`ensurePppoeProfile failed on ${router.ipAddress}: ${err.message}`);
      conn.close();
    }
  }

  /** Delete a PPPoE secret by username. */
  async deletePppoeSecret(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    name: string,
  ): Promise<boolean> {
    const conn = this.routerConn(router);
    try {
      await conn.connect();
      const secrets = await conn.write('/ppp/secret/print', [`?name=${name}`]) as any[];
      if (!secrets || secrets.length === 0) {
        conn.close();
        return true; // already removed
      }
      const id = secrets[0]['.id'];
      await conn.write('/ppp/secret/remove', [`=.id=${id}`]);
      conn.close();
      this.logger.log(`PPPoE secret deleted: ${name} on ${router.ipAddress}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`deletePppoeSecret failed for ${name}: ${err.message}`);
      conn.close();
      return false;
    }
  }

  /**
   * Disconnect all active PPPoE sessions for a given username.
   * Used after disabling a secret to force-kick the subscriber.
   * Returns the number of sessions that were disconnected.
   */
  async disconnectByUsername(
    router: { ipAddress: string; username: string; password: string; port?: number; connectionType?: string },
    username: string,
  ): Promise<number> {
    try {
      const connections = await this.getActiveConnections(router);
      const matching = connections.filter(c => c.name === username);
      let count = 0;
      for (const session of matching) {
        const ok = await this.disconnectPppSession(router, session.id);
        if (ok) count++;
      }
      if (count > 0) this.logger.log(`Disconnected ${count} active session(s) for: ${username}`);
      return count;
    } catch (err: any) {
      this.logger.warn(`disconnectByUsername failed for ${username}: ${err.message}`);
      return 0;
    }
  }
}
