import { Employee } from '../../employees/entities/employee.entity';
export declare class CreateSalaryDto {
    employee: Employee;
    amount: number;
    date: Date;
}
