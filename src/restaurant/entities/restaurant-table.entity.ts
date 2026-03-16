import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('restaurant_tables')
export class RestaurantTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column({ default: 4 })
  capacity: number;

  @Column({ default: 'available' })
  status: string; // available, occupied, reserved

  @Column({ nullable: true })
  section: string;
}
