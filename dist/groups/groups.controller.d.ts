import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(dto: CreateGroupDto): Promise<import("./entities/group.entity").Group>;
    findAll(): Promise<import("./entities/group.entity").Group[]>;
    findOne(id: string): Promise<import("./entities/group.entity").Group | null>;
    update(id: string, dto: UpdateGroupDto): Promise<import("./entities/group.entity").Group | null>;
    remove(id: string): Promise<void>;
}
