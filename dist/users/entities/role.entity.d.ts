import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class Role {
    id: number;
    name: string;
    users: User[];
    permissions: Permission[];
}
