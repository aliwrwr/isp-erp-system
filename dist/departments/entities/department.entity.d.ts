import { Employee } from '../../employees/entities/employee.entity';
export declare class Department {
    id: number;
    name: string;
    description: string;
    manager: string;
    permissions: string[];
    employees: Employee[];
}
