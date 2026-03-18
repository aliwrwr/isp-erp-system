import { Repository } from 'typeorm';
import { SystemSettings } from './entities/system-settings.entity';
export declare class SystemSettingsService {
    private readonly repo;
    constructor(repo: Repository<SystemSettings>);
    get(): Promise<SystemSettings>;
    update(data: Partial<SystemSettings>): Promise<SystemSettings>;
}
