import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
export declare class EmployeesService {
    private employeesRepository;
    private usersService;
    private readonly logger;
    constructor(employeesRepository: Repository<Employee>, usersService: UsersService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findByDepartment(departmentId: number): Promise<Employee[]>;
    findByUsername(username: string): Promise<Employee | null>;
    findOne(id: number): Promise<Employee | null>;
    update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee | null>;
    remove(id: number): Promise<void>;
}
