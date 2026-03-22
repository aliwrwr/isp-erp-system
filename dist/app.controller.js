"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
function parsePingOutput(output) {
    const winMatch = output.match(/Average[=\s]+(\d+)(?:ms)?/i);
    if (winMatch?.[1])
        return Number(winMatch[1]);
    const unixMatch = output.match(/time=(\d+(?:\.\d+)?)\s*ms/i);
    if (unixMatch?.[1])
        return Number(Number(unixMatch[1]).toFixed(0));
    return null;
}
function pingHost(host) {
    return new Promise(resolve => {
        const count = 1;
        const cmd = process.platform === 'win32' ? `ping -n ${count} ${host}` : `ping -c ${count} ${host}`;
        (0, child_process_1.exec)(cmd, { timeout: 5000 }, (err, stdout) => {
            if (err || !stdout)
                return resolve(null);
            resolve(parsePingOutput(stdout));
        });
    });
}
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getSystemStats() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const ram = Math.round((totalMem - freeMem) / totalMem * 100);
        const cpu = await new Promise(resolve => {
            const sample = () => {
                const cpus = os.cpus();
                let idle = 0, total = 0;
                for (const c of cpus) {
                    for (const v of Object.values(c.times))
                        total += v;
                    idle += c.times.idle;
                }
                return { idle, total };
            };
            const s1 = sample();
            setTimeout(() => {
                const s2 = sample();
                const idleDelta = s2.idle - s1.idle;
                const totalDelta = s2.total - s1.total;
                resolve(totalDelta === 0 ? 0 : Math.round((1 - idleDelta / totalDelta) * 100));
            }, 300);
        });
        let disk = 0;
        try {
            const fs = await import('fs');
            const mountPath = process.platform === 'win32' ? 'C:\\' : '/';
            const stat = fs.statfsSync(mountPath);
            disk = Math.round((1 - stat.bfree / stat.blocks) * 100);
        }
        catch {
            disk = 0;
        }
        const uptime = Math.round(os.uptime());
        const [dnsPing, googlePing] = await Promise.all([
            pingHost('1.1.1.1').catch(() => null),
            pingHost('google.com').catch(() => null),
        ]);
        return { cpu, ram, disk, uptime, dnsPing, googlePing };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('system/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSystemStats", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map