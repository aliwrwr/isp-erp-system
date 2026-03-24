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
    restart(secret: string): {
        ok: boolean;
        message: string;
    };
    gitPull(secret: string): {
        ok: boolean;
        gitHead: string;
        fetch: string;
        reset: string;
        clean: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        gitHead?: undefined;
        fetch?: undefined;
        reset?: undefined;
        clean?: undefined;
    };
    getStatus(secret: string): {
        ok: boolean;
        gitHead: string;
        cwd: string;
        sslDir: string;
        sslFiles: string[];
        sslCrtExists: boolean;
        sslKeyExists: boolean;
    };
    fixPm2(secret: string): {
        ok: boolean;
        message: string;
    };
    private runUpdate;
}
