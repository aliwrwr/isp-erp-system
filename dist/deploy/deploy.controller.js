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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployController = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const DEPLOY_SECRET = 'isp-deploy-secret-2026';
let DeployController = class DeployController {
    logFile = path.join(process.cwd(), 'logs', 'deploy-update.log');
    trigger(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        return this.runUpdate();
    }
    getLogs(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        if (!(0, fs_1.existsSync)(this.logFile)) {
            return { ok: false, log: 'لم يتم تشغيل أي تحديث بعد على هذا الجهاز.' };
        }
        const content = (0, fs_1.readFileSync)(this.logFile, 'utf8').replace(/\0/g, '');
        const lines = content.split(/\r?\n/).slice(-200).join('\n');
        return { ok: true, log: lines };
    }
    triggerAdmin() {
        return this.runUpdate();
    }
    getAdminLogs() {
        if (!(0, fs_1.existsSync)(this.logFile)) {
            return { ok: false, log: 'لم يتم تشغيل أي تحديث بعد على هذا الجهاز.' };
        }
        const content = (0, fs_1.readFileSync)(this.logFile, 'utf8').replace(/\0/g, '');
        const lines = content.split(/\r?\n/).slice(-300).join('\n');
        return { ok: true, log: lines };
    }
    restart(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        const pm2 = `${process.env.APPDATA}\\npm\\pm2.cmd`;
        const cmd = `"${pm2}" restart isp-backend & timeout /t 3 /nobreak & "${pm2}" restart isp-frontend & "${pm2}" save`;
        (0, child_process_1.spawn)('cmd.exe', ['/c', cmd], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
        return { ok: true, message: 'PM2 restart triggered' };
    }
    runUpdate() {
        const scriptPath = path.join(process.cwd(), 'update.ps1');
        (0, fs_1.mkdirSync)(path.dirname(this.logFile), { recursive: true });
        const fd = (0, fs_1.openSync)(this.logFile, 'w');
        const child = (0, child_process_1.spawn)('cmd.exe', ['/c', 'start', '', '/B', 'powershell.exe',
            '-ExecutionPolicy', 'Bypass',
            '-NonInteractive',
            '-File', scriptPath], { detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
        (0, fs_1.closeSync)(fd);
        child.unref();
        return { ok: true, message: 'التحديث بدأ — انتظر دقيقة ثم راجع السجل' };
    }
};
exports.DeployController = DeployController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "trigger", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "getLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "triggerAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "getAdminLogs", null);
__decorate([
    (0, common_1.Post)('restart'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "restart", null);
exports.DeployController = DeployController = __decorate([
    (0, common_1.Controller)('deploy')
], DeployController);
//# sourceMappingURL=deploy.controller.js.map