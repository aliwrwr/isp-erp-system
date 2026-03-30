import { DataSource } from 'typeorm';
export declare class BackupService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    private config;
    private loadConfig;
    private saveConfig;
    getDbPath(): string;
    getStatus(): {
        configured: boolean;
        enabled: boolean;
        folderId: string;
        lastBackup: string | null;
        lastError: string | null;
        dbExists: boolean;
        dbSizeKb: number;
        dbModified: string | null;
    };
    saveGoogleDriveConfig(serviceAccountJson: string, folderId: string, enabled: boolean): {
        success: boolean;
    };
    disableGoogleDrive(): {
        success: boolean;
    };
    restoreBackup(fileBuffer: Buffer): Promise<void>;
    private getAccessToken;
    private uploadToDrive;
    backupNow(): Promise<{
        success: boolean;
        fileId?: string;
        error?: string;
    }>;
    private localBackup;
    autoBackup(): Promise<void>;
}
