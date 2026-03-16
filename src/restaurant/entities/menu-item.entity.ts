import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MenuCategory } from './menu-category.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  cost: number;

  @ManyToOne(() => MenuCategory, cat => cat.items, { eager: true, nullable: true, onDelete: 'SET NULL' })
  category: MenuCategory;

  @Column({ default: true })
  available: boolean;

  @Column({ default: 0 })
  preparationTime: number;

  @Column({ nullable: true })
  image: string;
}
