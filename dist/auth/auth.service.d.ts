import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { EmployeesService } from '../employees/employees.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private employeesService;
    constructor(usersService: UsersService, jwtService: JwtService, employeesService: EmployeesService);
    validateUser(emailOrUsername: string, pass: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<User>;
    getProfile(userId: number): Promise<{
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
    }>;
}
