import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private repo: Repository<Supplier>,
  ) {}

  create(dto: CreateSupplierDto): Promise<Supplier> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Supplier[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Supplier> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('المورد غير موجود');
    return s;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
