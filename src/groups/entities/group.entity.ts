import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { nullable: true })
  layout: string; // dashboard layout JSON (used by GroupsView)

  @Column('text', { nullable: true })
  permissions: string; // security permission keys JSON array

  @Column({ nullable: true })
  dashboardId: number; // links this security-group to a dashboard-group

  @Column({ default: true })
  active: boolean;
}
