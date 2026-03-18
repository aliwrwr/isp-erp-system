import { SystemSettingsService } from './system-settings.service';
export declare class SystemSettingsController {
    private readonly service;
    constructor(service: SystemSettingsService);
    get(): Promise<import("./entities/system-settings.entity").SystemSettings>;
    update(body: any): Promise<import("./entities/system-settings.entity").SystemSettings>;
}
