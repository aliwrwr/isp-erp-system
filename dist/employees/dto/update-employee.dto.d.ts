import { Department } from '../../departments/entities/department.entity';
export declare class UpdateEmployeeDto {
    name?: string;
    username?: string;
    password?: string;
    phone?: string;
    address?: string;
    department?: Department;
    position?: string;
    salary?: number;
    hireDate?: Date;
    status?: string;
}
