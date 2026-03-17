import { Employee } from '../../employees/entities/employee.entity';
export declare class Attendance {
    id: number;
    employee: Employee;
    checkIn: Date;
    checkOut: Date;
}
