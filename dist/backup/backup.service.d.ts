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
        hasOAuth: boolean;
        dbExists: boolean;
        dbSizeKb: number;
        dbModified: string | null;
    };
    getAuthUrl(redirectUri: string): string;
    saveOAuthCredentials(clientId: string, clientSecret: string, folderId: string): {
        success: boolean;
    };
    exchangeCodeForToken(code: string, redirectUri: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    disableGoogleDrive(): {
        success: boolean;
    };
    restoreBackup(fileBuffer: Buffer): Promise<void>;
    private getAccessToken;
    private httpsPost;
    private uploadToDrive;
    backupNow(): Promise<{
        success: boolean;
        fileId?: string;
        error?: string;
    }>;
    private localBackup;
    autoBackup(): Promise<void>;
}
