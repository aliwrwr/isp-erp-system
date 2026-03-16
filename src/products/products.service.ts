import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const { categoryId, ...rest } = dto as any;
    const product = this.productsRepository.create({
      ...rest,
      ...(categoryId ? { category: { id: categoryId } } : {}),
    });
    const saved = await this.productsRepository.save(product);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ relations: ['category'] });
  }

  findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product | null> {
    const { categoryId, ...rest } = dto as any;
    const updateData: any = { ...rest };
    if (categoryId !== undefined) updateData.category = categoryId ? { id: categoryId } : null;
    await this.productsRepository.save({ id, ...updateData });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
