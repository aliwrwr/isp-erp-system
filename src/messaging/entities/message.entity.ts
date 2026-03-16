import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string; // phone number or identifier

  @Column({ default: 'sms' })
  type: string; // sms, whatsapp, email

  @Column('text')
  content: string;

  @Column({ nullable: true })
  templateName: string;

  @Column({ default: 'pending' })
  status: string; // pending, sent, delivered, failed

  @CreateDateColumn()
  sentAt: Date;
}
