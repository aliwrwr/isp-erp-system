import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  type: string; // in, out, adjustment

  @Column()
  quantity: number;

  @Column({ nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  date: Date;
}
