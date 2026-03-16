import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private usersService: UsersService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check for duplicate username
    if (createEmployeeDto.username) {
      const existing = await this.employeesRepository.findOne({ where: { username: createEmployeeDto.username } });
      if (existing) {
        throw new ConflictException('اسم المستخدم مسجل مسبقاً');
      }
    }

    // If employee has username and password, create a User account for login
    if (createEmployeeDto.username && createEmployeeDto.password) {
      const existingUser = await this.usersService.findByEmail(createEmployeeDto.username);
      if (!existingUser) {
        await this.usersService.create({
          name: createEmployeeDto.name,
          email: createEmployeeDto.username,
          password: createEmployeeDto.password,
          roles: [],
        });
        this.logger.log(`Created user account for employee: ${createEmployeeDto.username}`);
      }
    }

    const employee = this.employeesRepository.create(createEmployeeDto);
    // Hash password before storing in employee table
    if (employee.password) {
      employee.password = await bcrypt.hash(employee.password, 10);
    }
    return this.employeesRepository.save(employee);
  }

  findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({ relations: ['department'] });
  }

  findByDepartment(departmentId: number): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { department: { id: departmentId } },
      relations: ['department'],
    });
  }

  findByUsername(username: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({ where: { username }, relations: ['department'] });
  }

  findOne(id: number): Promise<Employee | null> {
    return this.employeesRepository.findOne({ where: { id }, relations: ['department'] });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee | null> {
    const employee = await this.findOne(id);
    const username = updateEmployeeDto.username || employee?.username;

    // If employee has username + password, ensure a User account exists
    if (username && updateEmployeeDto.password) {
      const user = await this.usersService.findByEmail(username);
      if (user) {
        await this.usersService.update(user.id, { password: updateEmployeeDto.password });
      } else {
        // Create User account for existing employees that don't have one
        await this.usersService.create({
          name: updateEmployeeDto.name || employee?.name || '',
          email: username,
          password: updateEmployeeDto.password,
          roles: [],
        });
        this.logger.log(`Created user account for existing employee: ${username}`);
      }
    } else if (updateEmployeeDto.username && employee?.username && updateEmployeeDto.username !== employee.username) {
      // Username changed - update the linked User's email
      const user = await this.usersService.findByEmail(employee.username);
      if (user) {
        await this.usersService.update(user.id, { email: updateEmployeeDto.username } as any);
      }
    }

    // Hash password before storing in employee table
    if (updateEmployeeDto.password) {
      updateEmployeeDto.password = await bcrypt.hash(updateEmployeeDto.password, 10);
    }
    await this.employeesRepository.update(id, updateEmployeeDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Delete linked User account
    const employee = await this.findOne(id);
    if (employee?.username) {
      const user = await this.usersService.findByEmail(employee.username);
      if (user) {
        await this.usersService.remove(user.id);
      }
    }
    await this.employeesRepository.delete(id);
  }
}
