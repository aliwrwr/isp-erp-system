import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as querystring from 'querystring';

const DB_PATH = path.resolve(process.cwd(), 'isp-erp.sqlite');
const CONFIG_PATH = path.resolve(process.cwd(), 'backup-config.json');

interface BackupConfig {
  enabled: boolean;
  folderId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
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
    clientId: '',
    clientSecret: '',
    refreshToken: '',
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
      configured: !!this.config.refreshToken,
      enabled: this.config.enabled,
      folderId: this.config.folderId,
      lastBackup: this.config.lastBackup,
      lastError: this.config.lastError,
      hasOAuth: !!this.config.clientId && !!this.config.clientSecret,
      dbExists,
      dbSizeKb: dbExists ? Math.round(fs.statSync(DB_PATH).size / 1024) : 0,
      dbModified: dbExists ? fs.statSync(DB_PATH).mtime.toISOString() : null,
    };
  }

  getAuthUrl(redirectUri: string): string {
    const params = querystring.stringify({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  saveOAuthCredentials(clientId: string, clientSecret: string, folderId: string) {
    this.config.clientId = clientId;
    this.config.clientSecret = clientSecret;
    this.config.folderId = folderId;
    this.saveConfig();
    return { success: true };
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ success: boolean; error?: string }> {
    try {
      const postData = querystring.stringify({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const tokenData: any = await this.httpsPost('oauth2.googleapis.com', '/token', postData, {
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      if (tokenData.refresh_token) {
        this.config.refreshToken = tokenData.refresh_token;
        this.config.enabled = true;
        this.saveConfig();
        return { success: true };
      } else {
        return { success: false, error: tokenData.error_description || 'No refresh token returned' };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  disableGoogleDrive() {
    this.config.enabled = false;
    this.saveConfig();
    return { success: true };
  }

  async restoreBackup(fileBuffer: Buffer) {
    const tempPath = DB_PATH + '.restore_temp';
    fs.writeFileSync(tempPath, fileBuffer);

    try {
      await this.dataSource.destroy();
    } catch {}

    try {
      if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
      fs.renameSync(tempPath, DB_PATH);
    } catch (e) {
      fs.copyFileSync(tempPath, DB_PATH);
      fs.unlinkSync(tempPath);
    }

    this.logger.log('Database restored - restarting process...');
    setTimeout(() => process.exit(0), 500);
  }

  private async getAccessToken(): Promise<string> {
    const postData = querystring.stringify({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
      grant_type: 'refresh_token',
    });

    const tokenData: any = await this.httpsPost('oauth2.googleapis.com', '/token', postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    if (tokenData.access_token) return tokenData.access_token;
    throw new Error(tokenData.error_description || 'Failed to refresh access token');
  }

  private httpsPost(hostname: string, urlPath: string, body: string | Buffer, headers: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path: urlPath,
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Failed to parse response: ' + data.slice(0, 200))); }
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
      if (!this.config.refreshToken) {
        throw new Error('Google Drive not configured - OAuth not completed');
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

      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite'));
      if (files.length > 20) {
        files.sort().reverse();
        const filesToDelete = files.slice(20);
        for (const file of filesToDelete) {
          try { fs.unlinkSync(path.resolve(backupDir, file)); } catch(e) {}
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

    if (this.config.enabled && this.config.refreshToken) {
      this.logger.log('Running scheduled Google Drive backup...');
      await this.backupNow();
    }
  }
}
