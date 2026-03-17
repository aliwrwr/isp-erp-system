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
        dbExists: boolean;
        dbSizeKb: number;
        dbModified: string | null;
    };
    saveGDriveConfig(body: {
        serviceAccountJson: string;
        folderId: string;
        enabled: boolean;
    }): {
        success: boolean;
    };
    backupNow(): Promise<{
        success: boolean;
        fileId?: string;
        error?: string;
    }>;
    disableGDrive(): {
        success: boolean;
    };
}
