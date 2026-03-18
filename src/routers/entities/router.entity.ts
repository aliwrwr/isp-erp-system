import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ nullable: true, default: 8728 })
  port: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true, default: 'API' })
  connectionType: string;  // API | API-SSL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
