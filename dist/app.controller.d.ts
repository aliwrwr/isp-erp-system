import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getSystemStats(): Promise<{
        cpu: number;
        ram: number;
        disk: number;
    }>;
}
