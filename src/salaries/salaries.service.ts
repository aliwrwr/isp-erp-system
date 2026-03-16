import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary } from './entities/salary.entity';

@Injectable()
export class SalariesService {
  constructor(
    @InjectRepository(Salary)
    private salariesRepository: Repository<Salary>,
  ) {}

  create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    const salary = this.salariesRepository.create(createSalaryDto);
    return this.salariesRepository.save(salary);
  }

  findAll(): Promise<Salary[]> {
    return this.salariesRepository.find({ relations: ['employee'] });
  }

  findOne(id: number): Promise<Salary | null> {
    return this.salariesRepository.findOne({ where: { id }, relations: ['employee'] });
  }

  async update(id: number, updateSalaryDto: UpdateSalaryDto): Promise<Salary | null> {
    await this.salariesRepository.update(id, updateSalaryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.salariesRepository.delete(id);
  }
}
