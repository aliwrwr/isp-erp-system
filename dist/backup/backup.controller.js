"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const backup_service_1 = require("./backup.service");
let BackupController = class BackupController {
    backupService;
    constructor(backupService) {
        this.backupService = backupService;
    }
    downloadBackup(res) {
        const dbPath = this.backupService.getDbPath();
        const date = new Date().toISOString().slice(0, 10);
        res.download(dbPath, `isp-erp-backup-${date}.sqlite`);
    }
    async restoreBackup(file) {
        if (!file)
            throw new common_1.BadRequestException('لم يتم إرفاق أي ملف');
        const name = file.originalname.toLowerCase();
        if (!name.endsWith('.sqlite')) {
            throw new common_1.BadRequestException('يجب أن يكون الملف بصيغة .sqlite');
        }
        await this.backupService.restoreBackup(file.buffer);
        return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح' };
    }
    getGDriveStatus() {
        return this.backupService.getStatus();
    }
    saveGDriveConfig(body) {
        if (!body.serviceAccountJson) {
            throw new common_1.BadRequestException('يجب توفير ملف Service Account JSON');
        }
        try {
            const parsed = JSON.parse(body.serviceAccountJson);
            if (!parsed.client_email || !parsed.private_key) {
                throw new Error('Missing required fields');
            }
        }
        catch {
            throw new common_1.BadRequestException('صيغة JSON غير صالحة أو تنقص حقول مطلوبة');
        }
        return this.backupService.saveGoogleDriveConfig(body.serviceAccountJson, body.folderId || '', !!body.enabled);
    }
    async backupNow() {
        return this.backupService.backupNow();
    }
    disableGDrive() {
        return this.backupService.disableGoogleDrive();
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Get)('download'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "downloadBackup", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 500 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "restoreBackup", null);
__decorate([
    (0, common_1.Get)('gdrive-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "getGDriveStatus", null);
__decorate([
    (0, common_1.Post)('gdrive-config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "saveGDriveConfig", null);
__decorate([
    (0, common_1.Post)('gdrive-now'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "backupNow", null);
__decorate([
    (0, common_1.Post)('gdrive-disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "disableGDrive", null);
exports.BackupController = BackupController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('backup'),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupController);
//# sourceMappingURL=backup.controller.js.map