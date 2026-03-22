import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { EmployeesService } from '../employees/employees.service';
import { ManagersService } from '../managers/managers.service';
import { GroupsService } from '../groups/groups.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private employeesService;
    private managersService;
    private groupsService;
    constructor(usersService: UsersService, jwtService: JwtService, employeesService: EmployeesService, managersService: ManagersService, groupsService: GroupsService);
    validateUser(emailOrUsername: string, pass: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<User>;
    getProfile(reqUser: any): Promise<{
        id: number;
        name: string;
        email: string;
        roles: never[];
        employee: null;
        permissions: string[];
        type: string;
        managerId: number;
        groupId: number;
        dashboardLayout: string | null;
    } | {
        id: number;
        name: string;
        email: string;
        roles: {
            id: number;
            name: string;
        }[];
        employee: {
            id: number;
            name: string;
            department: {
                id: number;
                name: string;
                permissions: string[];
            } | null;
        } | null;
        permissions: string[];
        type?: undefined;
        managerId?: undefined;
        groupId?: undefined;
        dashboardLayout?: undefined;
    }>;
}
