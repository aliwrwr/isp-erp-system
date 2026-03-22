import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): Promise<{
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
    register(createUserDto: CreateUserDto): Promise<import("../users/entities/user.entity").User>;
}
