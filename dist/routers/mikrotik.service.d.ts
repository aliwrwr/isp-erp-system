export interface RouterStatus {
    online: boolean;
    identity?: string;
    version?: string;
    uptime?: string;
    cpu?: number;
    freeMemory?: number;
    totalMemory?: number;
    freeHdd?: number;
    totalHdd?: number;
    boardName?: string;
    serialNumber?: string;
    error?: string;
}
export interface RouterInterface {
    name: string;
    type: string;
    macAddress: string;
    running: boolean;
    disabled: boolean;
    txBps: number;
    rxBps: number;
    txPackets: number;
    rxPackets: number;
    comment?: string;
}
export interface ActiveConnection {
    id: string;
    name: string;
    service: string;
    address: string;
    macAddress: string;
    uptime: string;
    bytesIn: number;
    bytesOut: number;
    encoding?: string;
    comment?: string;
}
export declare class MikrotikService {
    private readonly logger;
    private createConnection;
    ping(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }): Promise<boolean>;
    getStatus(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }): Promise<RouterStatus>;
    getInterfaces(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }): Promise<RouterInterface[]>;
    getActiveConnections(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }): Promise<ActiveConnection[]>;
    getIpAddresses(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }): Promise<any[]>;
    disconnectPppSession(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }, sessionId: string): Promise<boolean>;
    private routerConn;
    createPppoeSecret(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }, secret: {
        name: string;
        password: string;
        profile?: string;
        comment?: string;
    }): Promise<boolean>;
    setPppoeSecretEnabled(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }, name: string, enabled: boolean): Promise<boolean>;
    updatePppoeSecret(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }, oldName: string, updates: {
        name?: string;
        password?: string;
        profile?: string;
    }): Promise<boolean>;
    deletePppoeSecret(router: {
        ipAddress: string;
        username: string;
        password: string;
        port?: number;
        connectionType?: string;
    }, name: string): Promise<boolean>;
}
