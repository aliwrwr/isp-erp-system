import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementsRepository: Repository<InventoryMovement>,
  ) {}

  create(dto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = this.movementsRepository.create(dto);
    return this.movementsRepository.save(movement);
  }

  findAll(): Promise<InventoryMovement[]> {
    return this.movementsRepository.find({ relations: ['product'], order: { date: 'DESC' } });
  }

  findOne(id: number): Promise<InventoryMovement | null> {
    return this.movementsRepository.findOne({ where: { id }, relations: ['product'] });
  }

  async remove(id: number): Promise<void> {
    await this.movementsRepository.delete(id);
  }
}
