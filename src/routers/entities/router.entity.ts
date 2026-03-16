import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('routers')
export class Router {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  ipAddress: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  port: number;
}
