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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const jwt = __importStar(require("jsonwebtoken"));
const DB_PATH = path.resolve(process.cwd(), 'isp-erp.sqlite');
const CONFIG_PATH = path.resolve(process.cwd(), 'backup-config.json');
let BackupService = BackupService_1 = class BackupService {
    dataSource;
    logger = new common_1.Logger(BackupService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.loadConfig();
    }
    config = {
        enabled: false,
        folderId: '',
        serviceAccount: null,
        lastBackup: null,
        lastError: null,
    };
    loadConfig() {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                this.config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            }
        }
        catch (e) {
            this.logger.error('Failed to load backup config: ' + e.message);
        }
    }
    saveConfig() {
        try {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
        }
        catch (e) {
            this.logger.error('Failed to save backup config: ' + e.message);
        }
    }
    getDbPath() {
        return DB_PATH;
    }
    getStatus() {
        const dbExists = fs.existsSync(DB_PATH);
        return {
            configured: !!this.config.serviceAccount,
            enabled: this.config.enabled,
            folderId: this.config.folderId,
            lastBackup: this.config.lastBackup,
            lastError: this.config.lastError,
            dbExists,
            dbSizeKb: dbExists ? Math.round(fs.statSync(DB_PATH).size / 1024) : 0,
            dbModified: dbExists ? fs.statSync(DB_PATH).mtime.toISOString() : null,
        };
    }
    saveGoogleDriveConfig(serviceAccountJson, folderId, enabled) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        this.config.serviceAccount = serviceAccount;
        this.config.folderId = folderId;
        this.config.enabled = enabled;
        this.saveConfig();
        return { success: true };
    }
    disableGoogleDrive() {
        this.config.enabled = false;
        this.saveConfig();
        return { success: true };
    }
    async restoreBackup(fileBuffer) {
        const tempPath = DB_PATH + '.restore_temp';
        fs.writeFileSync(tempPath, fileBuffer);
        try {
            await this.dataSource.destroy();
        }
        catch { }
        try {
            if (fs.existsSync(DB_PATH))
                fs.unlinkSync(DB_PATH);
            fs.renameSync(tempPath, DB_PATH);
        }
        catch (e) {
            fs.copyFileSync(tempPath, DB_PATH);
            fs.unlinkSync(tempPath);
        }
        this.logger.log('Database restored — restarting process...');
        setTimeout(() => process.exit(0), 500);
    }
    async getAccessToken() {
        const sa = this.config.serviceAccount;
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: sa.client_email,
            scope: 'https://www.googleapis.com/auth/drive',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
        };
        const jwtToken = jwt.sign(payload, sa.private_key, { algorithm: 'RS256' });
        return new Promise((resolve, reject) => {
            const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwtToken}`;
            const options = {
                hostname: 'oauth2.googleapis.com',
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body),
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.access_token)
                            resolve(parsed.access_token);
                        else
                            reject(new Error(parsed.error_description || 'Token request failed'));
                    }
                    catch {
                        reject(new Error('Failed to parse token response'));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
    async uploadToDrive(accessToken) {
        const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `isp-erp-backup-${now}.sqlite`;
        const fileBuffer = fs.readFileSync(DB_PATH);
        const boundary = 'backup_boundary_isp_erp';
        const metadata = JSON.stringify({
            name: fileName,
            ...(this.config.folderId ? { parents: [this.config.folderId] } : {}),
        });
        const bodyParts = [
            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
            `--${boundary}\r\nContent-Type: application/x-sqlite3\r\n\r\n`,
        ];
        const body = Buffer.concat([
            Buffer.from(bodyParts.join('')),
            fileBuffer,
            Buffer.from(`\r\n--${boundary}--`),
        ]);
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.googleapis.com',
                path: '/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': `multipart/related; boundary="${boundary}"`,
                    'Content-Length': body.length,
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.id)
                            resolve(parsed.id);
                        else
                            reject(new Error(parsed.error?.message || 'Upload failed'));
                    }
                    catch {
                        reject(new Error('Failed to parse upload response'));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
    async backupNow() {
        try {
            if (!this.config.serviceAccount) {
                throw new Error('Google Drive not configured');
            }
            const token = await this.getAccessToken();
            const fileId = await this.uploadToDrive(token);
            this.config.lastBackup = new Date().toISOString();
            this.config.lastError = null;
            this.saveConfig();
            this.logger.log(`Google Drive backup completed: ${fileId}`);
            return { success: true, fileId };
        }
        catch (e) {
            this.config.lastError = e.message;
            this.saveConfig();
            this.logger.error('Google Drive backup failed: ' + e.message);
            return { success: false, error: e.message };
        }
    }
    async localBackup() {
        try {
            const backupDir = path.resolve(process.cwd(), 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }
            const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const backupPath = path.resolve(backupDir, `isp-erp-backup-${now}.sqlite`);
            fs.copyFileSync(DB_PATH, backupPath);
            this.logger.log(`Local backup saved at: ${backupPath}`);
            const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
            if (files.length > 20) {
                files.sort().reverse();
                const filesToDelete = files.slice(20);
                for (const file of filesToDelete) {
                    try {
                        fs.unlinkSync(path.resolve(backupDir, file));
                    }
                    catch (e) { }
                }
            }
        }
        catch (e) {
            this.logger.error('Local backup failed: ' + e.message);
        }
    }
    async autoBackup() {
        this.logger.log('Running scheduled automatic backups...');
        await this.localBackup();
        if (this.config.enabled && this.config.serviceAccount) {
            this.logger.log('Running scheduled Google Drive backup...');
            await this.backupNow();
        }
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "autoBackup", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], BackupService);
//# sourceMappingURL=backup.service.js.map