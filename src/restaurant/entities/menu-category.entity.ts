import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('menu_categories')
export class MenuCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column('text', { nullable: true })
  image: string;

  @OneToMany(() => MenuItem, item => item.category)
  items: MenuItem[];
}
