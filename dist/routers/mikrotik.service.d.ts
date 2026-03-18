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
}
