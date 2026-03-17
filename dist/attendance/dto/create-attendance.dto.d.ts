import { Employee } from '../../employees/entities/employee.entity';
export declare class CreateAttendanceDto {
    employee: Employee;
    checkIn: Date;
    checkOut?: Date;
}
