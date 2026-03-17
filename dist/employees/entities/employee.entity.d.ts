import { Department } from '../../departments/entities/department.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Salary } from '../../salaries/entities/salary.entity';
export declare class Employee {
    id: number;
    name: string;
    username: string;
    password: string;
    phone: string;
    address: string;
    department: Department;
    position: string;
    salary: number;
    hireDate: Date;
    status: string;
    attendances: Attendance[];
    salaries: Salary[];
}
