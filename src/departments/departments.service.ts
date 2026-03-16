import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({ relations: ['employees'] });
  }

  findOne(id: number): Promise<Department | null> {
    return this.departmentsRepository.findOne({ where: { id }, relations: ['employees'] });
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department | null> {
    await this.departmentsRepository.update(id, updateDepartmentDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.departmentsRepository.delete(id);
  }
}
