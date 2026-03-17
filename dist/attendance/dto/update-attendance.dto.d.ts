import { Employee } from '../../employees/entities/employee.entity';
export declare class UpdateAttendanceDto {
    employee?: Employee;
    checkIn?: Date;
    checkOut?: Date;
}
