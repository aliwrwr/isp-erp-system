import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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
