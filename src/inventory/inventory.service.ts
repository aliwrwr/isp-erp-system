import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementsRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = this.movementsRepository.create(dto);
    const saved = await this.movementsRepository.save(movement);
    // Update product.stock
    const productId = (dto.product as any)?.id ?? dto.product;
    if (productId) {
      const product = await this.productsRepository.findOne({ where: { id: Number(productId) } });
      if (product) {
        if (dto.type === 'in') {
          product.stock = (product.stock || 0) + dto.quantity;
        } else if (dto.type === 'out') {
          product.stock = Math.max(0, (product.stock || 0) - dto.quantity);
        } else {
          product.stock = dto.quantity; // adjustment
        }
        await this.productsRepository.save(product);
      }
    }
    return saved;
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

  async getStats() {
    const products = await this.productsRepository.find();
    const total = products.length;
    const inStock  = products.filter(p => (p.stock || 0) > 5).length;
    const lowStock  = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const totalCostValue   = products.reduce((s, p) => s + (p.stock || 0) * Number(p.cost  || 0), 0);
    const totalRetailValue = products.reduce((s, p) => s + (p.stock || 0) * Number(p.price || 0), 0);
    return { total, inStock, lowStock, outOfStock, totalCostValue, totalRetailValue };
  }

  async getStockSummary() {
    const products = await this.productsRepository.find({ relations: ['category'] });

    const soldRows: any[] = await this.dataSource.query(
      `SELECT productId, SUM(quantity) as totalSold, SUM(quantity * price) as totalRevenue
       FROM invoice_items WHERE productId IS NOT NULL GROUP BY productId`,
    );
    const soldMap = new Map<number, { totalSold: number; totalRevenue: number }>(
      soldRows.map(r => [Number(r.productId), { totalSold: Number(r.totalSold), totalRevenue: Number(r.totalRevenue) }]),
    );

    return products
      .map(p => {
        const sold  = soldMap.get(p.id) || { totalSold: 0, totalRevenue: 0 };
        const stock = p.stock || 0;
        const stockStatus: 'out' | 'low' | 'ok' = stock === 0 ? 'out' : stock <= 5 ? 'low' : 'ok';
        return {
          id: p.id,
          name: p.name,
          barcode: p.barcode || null,
          category: p.category?.name || null,
          supplier: p.supplier || null,
          price: Number(p.price),
          cost: p.cost ? Number(p.cost) : null,
          stock,
          stockCostValue:   stock * Number(p.cost  || 0),
          stockRetailValue: stock * Number(p.price || 0),
          totalSold: sold.totalSold,
          totalRevenue: sold.totalRevenue,
          stockStatus,
        };
      })
      .sort((a, b) => {
        const order = { out: 0, low: 1, ok: 2 };
        return order[a.stockStatus] - order[b.stockStatus];
      });
  }
}
