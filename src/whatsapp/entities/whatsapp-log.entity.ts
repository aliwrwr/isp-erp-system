import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('whatsapp_logs')
export class WhatsappLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  /** activation | expiry_warning | expiry | manual */
  @Column({ length: 30 })
  type: string;

  @Column({ length: 30 })
  phone: string;

  @Column({ length: 150 })
  subscriberName: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}
