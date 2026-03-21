import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  loans: number;

  @Column('text', { nullable: true })
  permissions: string;

  @Column({ nullable: true })
  parentId: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  points: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  position: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: true })
  active: boolean;
}
