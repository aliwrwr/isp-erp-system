"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MikrotikService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikrotikService = void 0;
const common_1 = require("@nestjs/common");
const node_routeros_1 = require("node-routeros");
let MikrotikService = MikrotikService_1 = class MikrotikService {
    logger = new common_1.Logger(MikrotikService_1.name);
    createConnection(host, username, password, port = 8728, isSsl = false) {
        return new node_routeros_1.RouterOSAPI({
            host,
            user: username,
            password,
            port,
            tls: isSsl,
            tlsOptions: isSsl ? { rejectUnauthorized: false } : undefined,
            keepalive: false,
            timeout: 10,
        });
    }
    async ping(router) {
        const isSsl = router.connectionType === 'API-SSL';
        const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
        try {
            await conn.connect();
            conn.close();
            return true;
        }
        catch {
            return false;
        }
    }
    async getStatus(router) {
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
            const identity = identityRes[0];
            const res = resourceRes[0];
            const board = boardRes[0];
            const parseBytes = (val) => parseInt(String(val)) || 0;
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
        }
        catch (err) {
            this.logger.warn(`MikroTik ping failed for ${router.ipAddress}: ${err.message}`);
            return { online: false, error: err.message };
        }
    }
    async getInterfaces(router) {
        const isSsl = router.connectionType === 'API-SSL';
        const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
        try {
            await conn.connect();
            const [intfList, stats] = await Promise.all([
                conn.write('/interface/print'),
                conn.write('/interface/print', ['=stats=']).catch(() => []),
            ]);
            conn.close();
            const statsMap = {};
            stats.forEach((s) => { if (s.name)
                statsMap[s.name] = s; });
            return intfList.map((i) => {
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
        }
        catch (err) {
            this.logger.warn(`getInterfaces failed for ${router.ipAddress}: ${err.message}`);
            return [];
        }
    }
    async getActiveConnections(router) {
        const isSsl = router.connectionType === 'API-SSL';
        const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
        try {
            await conn.connect();
            const pppoe = await conn.write('/ppp/active/print', [
                '=.proplist=.id,name,service,address,uptime,bytes-in,bytes-out,caller-id,encoding',
            ]).catch(() => conn.write('/ppp/active/print').catch(() => []));
            conn.close();
            return pppoe.map((s) => ({
                id: s['.id'] || '',
                name: s.name || '',
                service: s.service || 'pppoe',
                address: s.address || '',
                macAddress: s['caller-id'] || '',
                uptime: s.uptime || '',
                bytesIn: parseInt(s['bytes-out']) || 0,
                bytesOut: parseInt(s['bytes-in']) || 0,
                encoding: s.encoding || '',
                comment: s.comment || '',
            }));
        }
        catch (err) {
            this.logger.warn(`getActiveConnections failed for ${router.ipAddress}: ${err.message}`);
            return [];
        }
    }
    async getIpAddresses(router) {
        const isSsl = router.connectionType === 'API-SSL';
        const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
        try {
            await conn.connect();
            const result = await conn.write('/ip/address/print');
            conn.close();
            return result.map((a) => ({
                id: a['.id'],
                address: a.address,
                network: a.network,
                interface: a.interface,
                disabled: a.disabled === 'true',
                comment: a.comment || '',
            }));
        }
        catch (err) {
            return [];
        }
    }
    async disconnectPppSession(router, sessionId) {
        const isSsl = router.connectionType === 'API-SSL';
        const conn = this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
        try {
            await conn.connect();
            await conn.write('/ppp/active/remove', [`=.id=${sessionId}`]);
            conn.close();
            return true;
        }
        catch (err) {
            this.logger.warn(`disconnectPppSession failed: ${err.message}`);
            return false;
        }
    }
    routerConn(router) {
        const isSsl = router.connectionType === 'API-SSL';
        return this.createConnection(router.ipAddress, router.username, router.password, router.port || (isSsl ? 8729 : 8728), isSsl);
    }
    async createPppoeSecret(router, secret) {
        const conn = this.routerConn(router);
        try {
            await conn.connect();
            const params = [
                `=name=${secret.name}`,
                `=password=${secret.password}`,
                `=service=pppoe`,
                `=disabled=no`,
            ];
            if (secret.profile)
                params.push(`=profile=${secret.profile}`);
            if (secret.comment)
                params.push(`=comment=${secret.comment}`);
            await conn.write('/ppp/secret/add', params);
            conn.close();
            this.logger.log(`PPPoE secret created: ${secret.name} on ${router.ipAddress}`);
            return true;
        }
        catch (err) {
            this.logger.warn(`createPppoeSecret failed for ${secret.name}: ${err.message}`);
            conn.close();
            return false;
        }
    }
    async setPppoeSecretEnabled(router, name, enabled) {
        const conn = this.routerConn(router);
        try {
            await conn.connect();
            const secrets = await conn.write('/ppp/secret/print', [`?name=${name}`]);
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
        }
        catch (err) {
            this.logger.warn(`setPppoeSecretEnabled failed for ${name}: ${err.message}`);
            conn.close();
            return false;
        }
    }
    async updatePppoeSecret(router, oldName, updates) {
        const conn = this.routerConn(router);
        try {
            await conn.connect();
            const secrets = await conn.write('/ppp/secret/print', [`?name=${oldName}`]);
            if (!secrets || secrets.length === 0) {
                conn.close();
                this.logger.warn(`updatePppoeSecret: secret not found: ${oldName}`);
                return false;
            }
            const id = secrets[0]['.id'];
            const params = [`=.id=${id}`];
            if (updates.name)
                params.push(`=name=${updates.name}`);
            if (updates.password)
                params.push(`=password=${updates.password}`);
            if (updates.profile)
                params.push(`=profile=${updates.profile}`);
            await conn.write('/ppp/secret/set', params);
            conn.close();
            this.logger.log(`PPPoE secret updated: ${oldName} on ${router.ipAddress}`);
            return true;
        }
        catch (err) {
            this.logger.warn(`updatePppoeSecret failed for ${oldName}: ${err.message}`);
            conn.close();
            return false;
        }
    }
    async deletePppoeSecret(router, name) {
        const conn = this.routerConn(router);
        try {
            await conn.connect();
            const secrets = await conn.write('/ppp/secret/print', [`?name=${name}`]);
            if (!secrets || secrets.length === 0) {
                conn.close();
                return true;
            }
            const id = secrets[0]['.id'];
            await conn.write('/ppp/secret/remove', [`=.id=${id}`]);
            conn.close();
            this.logger.log(`PPPoE secret deleted: ${name} on ${router.ipAddress}`);
            return true;
        }
        catch (err) {
            this.logger.warn(`deletePppoeSecret failed for ${name}: ${err.message}`);
            conn.close();
            return false;
        }
    }
};
exports.MikrotikService = MikrotikService;
exports.MikrotikService = MikrotikService = MikrotikService_1 = __decorate([
    (0, common_1.Injectable)()
], MikrotikService);
//# sourceMappingURL=mikrotik.service.js.map