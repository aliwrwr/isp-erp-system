import { SystemSettingsService } from './system-settings.service';
import { SystemSettings } from './entities/system-settings.entity';
export declare class SystemSettingsController {
    private readonly service;
    constructor(service: SystemSettingsService);
    get(): Promise<SystemSettings>;
    update(body: Partial<SystemSettings>): Promise<SystemSettings>;
}
