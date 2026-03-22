import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { EmployeesService } from '../../employees/employees.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    private employeesService;
    constructor(configService: ConfigService, usersService: UsersService, employeesService: EmployeesService);
    validate(payload: any): Promise<{
        userId: any;
        username: any;
        name: any;
        type: string;
        managerId: any;
        isSuperAdmin: boolean;
        permissions: any;
        roles?: undefined;
        employeeId?: undefined;
        departmentId?: undefined;
    } | {
        userId: number;
        username: string;
        type: string;
        roles: import("../../users/entities/role.entity").Role[];
        isSuperAdmin: boolean;
        employeeId: number | null;
        departmentId: number | null;
        permissions: string[];
        name?: undefined;
        managerId?: undefined;
    } | null>;
}
export {};
