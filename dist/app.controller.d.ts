import { AppService } from './app.service';
import { GroupsService } from './groups/groups.service';
export declare class AppController {
    private readonly appService;
    private readonly groupsService;
    constructor(appService: AppService, groupsService: GroupsService);
    clearGroupsTemp(secret: string): Promise<{
        error: string;
        cleared?: undefined;
    } | {
        cleared: boolean;
        error?: undefined;
    }>;
    getHello(): string;
    getSystemStats(): Promise<{
        cpu: number;
        ram: number;
        disk: number;
    }>;
}
