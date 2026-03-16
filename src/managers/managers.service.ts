import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from './entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private managersRepository: Repository<Manager>,
  ) {}

  create(dto: CreateManagerDto): Promise<Manager> {
    return this.managersRepository.save(this.managersRepository.create(dto));
  }

  findAll(): Promise<Manager[]> {
    return this.managersRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: number): Promise<Manager | null> {
    return this.managersRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateManagerDto): Promise<Manager | null> {
    await this.managersRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.managersRepository.delete(id);
  }
}
