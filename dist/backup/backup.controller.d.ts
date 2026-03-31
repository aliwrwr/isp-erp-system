import type { Response } from 'express';
import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    downloadBackup(res: Response): void;
    restoreBackup(file: {
        originalname: string;
        buffer: Buffer;
        size: number;
        mimetype: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getGDriveStatus(): {
        configured: boolean;
        enabled: boolean;
        folderId: string;
        lastBackup: string | null;
        lastError: string | null;
        hasOAuth: boolean;
        dbExists: boolean;
        dbSizeKb: number;
        dbModified: string | null;
    };
    saveGDriveConfig(body: {
        clientId: string;
        clientSecret: string;
        folderId: string;
    }): {
        success: boolean;
    };
    getAuthUrl(redirectUri: string): {
        url: string;
    };
    handleOAuthCallback(body: {
        code: string;
        redirect_uri: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    backupNow(): Promise<{
        success: boolean;
        fileId?: string;
        error?: string;
    }>;
    disableGDrive(): {
        success: boolean;
    };
}
