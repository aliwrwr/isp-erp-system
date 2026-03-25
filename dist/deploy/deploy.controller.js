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
        const tempDir = process.env.TEMP ?? `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
        const scriptPath = path.join(tempDir, 'isp-pm2-restart.ps1');
        (0, fs_1.writeFileSync)(scriptPath, `Set-Location "D:\\isp-erp-system"\r\n` +
            `& "${pm2}" stop isp-backend\r\n` +
            `& "${pm2}" stop isp-frontend\r\n` +
            `& "${pm2}" stop isp-frontend-8080\r\n` +
            `Start-Sleep -Seconds 3\r\n` +
            `& "${pm2}" start isp-backend\r\n` +
            `& "${pm2}" start isp-frontend\r\n` +
            `& "${pm2}" start isp-frontend-8080\r\n` +
            `& "${pm2}" save\r\n`);
        const future = new Date(Date.now() + 120000);
        const timeStr = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${String(future.getMonth() + 1).padStart(2, '0')}/${String(future.getDate()).padStart(2, '0')}/${future.getFullYear()}`;
        (0, child_process_1.spawn)('schtasks', [
            '/create', '/f',
            '/tn', 'ISP-PM2-Restart',
            '/sc', 'once',
            '/sd', dateStr,
            '/st', timeStr,
            '/tr', `powershell.exe -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${scriptPath}"`,
        ], { stdio: 'ignore', windowsHide: true, detached: true }).unref();
        return { ok: true, message: `PM2 restart scheduled at ${timeStr}` };
    }
    gitPull(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        const cwd = process.cwd();
        try {
            const fetch = (0, child_process_1.execSync)('git fetch origin', { cwd, encoding: 'utf8', timeout: 30000 });
            const reset = (0, child_process_1.execSync)('git reset --hard origin/main', { cwd, encoding: 'utf8', timeout: 30000 });
            const clean = (0, child_process_1.execSync)('git clean -fd', { cwd, encoding: 'utf8', timeout: 10000 });
            let gitHead = 'unknown';
            try {
                gitHead = (0, child_process_1.execSync)('git rev-parse --short HEAD', { cwd, encoding: 'utf8' }).trim();
            }
            catch { }
            return { ok: true, gitHead, fetch, reset, clean };
        }
        catch (err) {
            return { ok: false, error: String(err?.message ?? err) };
        }
    }
    getStatus(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        const cwd = process.cwd();
        const sslDir = path.join(cwd, 'frontend', 'ssl');
        let gitHead = 'unknown';
        try {
            gitHead = (0, child_process_1.execSync)('git rev-parse --short HEAD', { cwd, encoding: 'utf8' }).trim();
        }
        catch { }
        const fsNative = require('fs');
        const sslFiles = (0, fs_1.existsSync)(sslDir)
            ? (0, fs_1.readdirSync)(sslDir).map(f => {
                try {
                    return `${f} (${fsNative.statSync(path.join(sslDir, f)).size}b)`;
                }
                catch {
                    return f;
                }
            })
            : ['ssl/ not found'];
        return {
            ok: true, gitHead, cwd, sslDir,
            sslFiles,
            sslCrtExists: (0, fs_1.existsSync)(path.join(sslDir, 'server.crt')),
            sslKeyExists: (0, fs_1.existsSync)(path.join(sslDir, 'server.key')),
        };
    }
    fixPm2(secret) {
        if (!secret || secret !== DEPLOY_SECRET) {
            throw new common_1.UnauthorizedException('Invalid deploy secret');
        }
        const pm2Cmd = `${process.env.APPDATA}\\npm\\pm2.cmd`;
        const projectPath = process.cwd();
        const tempDir = process.env.TEMP ?? `${process.env.USERPROFILE}\\AppData\\Local\\Temp`;
        const scriptPath = path.join(tempDir, 'isp-pm2-full-reset.ps1');
        const script = `Start-Sleep -Seconds 10\r\n` +
            `Set-Location "${projectPath}"\r\n` +
            `git fetch origin\r\n` +
            `git reset --hard origin/main\r\n` +
            `git clean -fd\r\n` +
            `& "${pm2Cmd}" kill\r\n` +
            `Start-Sleep -Seconds 5\r\n` +
            `Set-Location "${projectPath}"\r\n` +
            `& "${pm2Cmd}" start ecosystem.config.js\r\n` +
            `& "${pm2Cmd}" save\r\n`;
        (0, fs_1.writeFileSync)(scriptPath, script);
        const future = new Date(Date.now() + 30000);
        const timeStr = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${String(future.getMonth() + 1).padStart(2, '0')}/${String(future.getDate()).padStart(2, '0')}/${future.getFullYear()}`;
        (0, child_process_1.spawn)('schtasks', [
            '/create', '/f',
            '/tn', 'ISP-PM2-Full-Reset',
            '/sc', 'once',
            '/sd', dateStr,
            '/st', timeStr,
            '/tr', `powershell.exe -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${scriptPath}"`,
        ], { stdio: 'ignore', windowsHide: true, detached: true }).unref();
        return {
            ok: true,
            message: `PM2 full reset scheduled at ${timeStr} — all services will restart in ~30-60s`,
        };
    }
    runUpdate() {
        const scriptPath = path.join(process.cwd(), 'update.ps1');
        (0, fs_1.mkdirSync)(path.dirname(this.logFile), { recursive: true });
        try {
            (0, fs_1.writeFileSync)(this.logFile, '');
        }
        catch { }
        (0, child_process_1.spawn)('powershell.exe', [
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy', 'Bypass',
            '-File', scriptPath
        ], { stdio: 'ignore', windowsHide: true, detached: true }).unref();
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
__decorate([
    (0, common_1.Post)('pull'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "gitPull", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('fix-pm2'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-deploy-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeployController.prototype, "fixPm2", null);
exports.DeployController = DeployController = __decorate([
    (0, common_1.Controller)('deploy')
], DeployController);
//# sourceMappingURL=deploy.controller.js.map