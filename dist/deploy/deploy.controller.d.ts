export declare class DeployController {
    private readonly logFile;
    trigger(secret: string): {
        ok: boolean;
        message: string;
    };
    getLogs(secret: string): {
        ok: boolean;
        log: string;
    };
    triggerAdmin(): {
        ok: boolean;
        message: string;
    };
    getAdminLogs(): {
        ok: boolean;
        log: string;
    };
    private runUpdate;
}
