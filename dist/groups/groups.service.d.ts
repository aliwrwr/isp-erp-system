import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsService implements OnModuleInit {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<Group>);
    onModuleInit(): Promise<void>;
    create(dto: CreateGroupDto): Promise<Group>;
    findAll(): Promise<Group[]>;
    findOne(id: number): Promise<Group | null>;
    update(id: number, dto: UpdateGroupDto): Promise<Group | null>;
    remove(id: number): Promise<void>;
    removeAll(): Promise<void>;
}
