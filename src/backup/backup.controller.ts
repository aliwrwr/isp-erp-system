import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupService } from './backup.service';

@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('download')
  downloadBackup(@Res() res: Response) {
    const dbPath = this.backupService.getDbPath();
    const date = new Date().toISOString().slice(0, 10);
    res.download(dbPath, `isp-erp-backup-${date}.sqlite`);
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 500 * 1024 * 1024 } }))
  async restoreBackup(@UploadedFile() file: { originalname: string; buffer: Buffer; size: number; mimetype: string }) {
    if (!file) throw new BadRequestException('لم يتم إرفاق أي ملف');
    const name = file.originalname.toLowerCase();
    if (!name.endsWith('.sqlite')) {
      throw new BadRequestException('يجب أن يكون الملف بصيغة .sqlite');
    }
    await this.backupService.restoreBackup(file.buffer);
    return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح' };
  }

  @Get('gdrive-status')
  getGDriveStatus() {
    return this.backupService.getStatus();
  }

  @Post('gdrive-config')
  saveGDriveConfig(
    @Body()
    body: {
      serviceAccountJson: string;
      folderId: string;
      enabled: boolean;
    },
  ) {
    if (!body.serviceAccountJson) {
      throw new BadRequestException('يجب توفير ملف Service Account JSON');
    }
    try {
      const parsed = JSON.parse(body.serviceAccountJson);
      if (!parsed.client_email || !parsed.private_key) {
        throw new Error('Missing required fields');
      }
    } catch {
      throw new BadRequestException('صيغة JSON غير صالحة أو تنقص حقول مطلوبة');
    }
    return this.backupService.saveGoogleDriveConfig(
      body.serviceAccountJson,
      body.folderId || '',
      !!body.enabled,
    );
  }

  @Post('gdrive-now')
  async backupNow() {
    return this.backupService.backupNow();
  }

  @Post('gdrive-disable')
  disableGDrive() {
    return this.backupService.disableGoogleDrive();
  }
}
