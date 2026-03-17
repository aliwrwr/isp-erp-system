import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, Product])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
