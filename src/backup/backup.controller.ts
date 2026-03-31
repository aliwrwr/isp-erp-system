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
    @Body() body: { clientId: string; clientSecret: string; folderId: string },
  ) {
    if (!body.clientId || !body.clientSecret) {
      throw new BadRequestException('يجب توفير Client ID و Client Secret');
    }
    return this.backupService.saveOAuthCredentials(
      body.clientId.trim(),
      body.clientSecret.trim(),
      body.folderId?.trim() || '',
    );
  }

  @Get('gdrive-auth-url')
  getAuthUrl() {
    return { url: this.backupService.getAuthUrl() };
  }

  @Post('gdrive-callback')
  async handleOAuthCallback(
    @Body() body: { code: string },
  ) {
    if (!body.code) throw new BadRequestException('Authorization code is required');
    return this.backupService.exchangeCodeForToken(body.code);
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
