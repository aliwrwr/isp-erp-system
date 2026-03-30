import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as jwt from 'jsonwebtoken';

const DB_PATH = path.resolve(process.cwd(), 'isp-erp.sqlite');
const CONFIG_PATH = path.resolve(process.cwd(), 'backup-config.json');

interface BackupConfig {
  enabled: boolean;
  folderId: string;
  serviceAccount: Record<string, string> | null;
  lastBackup: string | null;
  lastError: string | null;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.loadConfig();
  }

  private config: BackupConfig = {
    enabled: false,
    folderId: '',
    serviceAccount: null,
    lastBackup: null,
    lastError: null,
  };

  private loadConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        this.config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      }
    } catch (e) {
      this.logger.error('Failed to load backup config: ' + e.message);
    }
  }

  private saveConfig() {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
    } catch (e) {
      this.logger.error('Failed to save backup config: ' + e.message);
    }
  }

  getDbPath(): string {
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

  saveGoogleDriveConfig(serviceAccountJson: string, folderId: string, enabled: boolean) {
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

  async restoreBackup(fileBuffer: Buffer) {
    // 1. كتابة الملف المؤقت
    const tempPath = DB_PATH + '.restore_temp';
    fs.writeFileSync(tempPath, fileBuffer);

    // 2. إغلاق اتصال قاعدة البيانات حتى يمكن استبدال الملف على Windows
    try {
      await this.dataSource.destroy();
    } catch {}

    // 3. استبدال الملف
    try {
      if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
      fs.renameSync(tempPath, DB_PATH);
    } catch (e) {
      // محاولة أخرى بـ copyFile إذا فشل rename
      fs.copyFileSync(tempPath, DB_PATH);
      fs.unlinkSync(tempPath);
    }

    // 4. إعادة تشغيل العملية حتى يعيد TypeORM فتح الاتصال من الصفر
    this.logger.log('Database restored — restarting process...');
    setTimeout(() => process.exit(0), 500);
  }

  private async getAccessToken(): Promise<string> {
    const sa = this.config.serviceAccount as any;
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
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
            if (parsed.access_token) resolve(parsed.access_token);
            else reject(new Error(parsed.error_description || 'Token request failed'));
          } catch {
            reject(new Error('Failed to parse token response'));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private async uploadToDrive(accessToken: string): Promise<string> {
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
        path: '/upload/drive/v3/files?uploadType=multipart',
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
            if (parsed.id) resolve(parsed.id);
            else reject(new Error(parsed.error?.message || 'Upload failed'));
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async backupNow(): Promise<{ success: boolean; fileId?: string; error?: string }> {
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
    } catch (e) {
      this.config.lastError = e.message;
      this.saveConfig();
      this.logger.error('Google Drive backup failed: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  private async localBackup() {
    try {
      const backupDir = path.resolve(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.resolve(backupDir, `isp-erp-backup-${now}.sqlite`);
      fs.copyFileSync(DB_PATH, backupPath);
      this.logger.log(`Local backup saved at: ${backupPath}`);
      
      // Clean up old backups (keep last 20)
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
      if (files.length > 20) {
        files.sort().reverse();
        const filesToDelete = files.slice(20);
        for (const file of filesToDelete) {
          try {
            fs.unlinkSync(path.resolve(backupDir, file));
          } catch(e) {}
        }
      }
    } catch(e) {
      this.logger.error('Local backup failed: ' + e.message);
    }
  }

  @Cron('0 */6 * * *')
  async autoBackup() {
    this.logger.log('Running scheduled automatic backups...');
    await this.localBackup();
    
    if (this.config.enabled && this.config.serviceAccount) {
      this.logger.log('Running scheduled Google Drive backup...');
      await this.backupNow();
    }
  }
}
