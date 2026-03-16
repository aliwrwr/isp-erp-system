import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('message_templates')
export class MessageTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text')
  content: string;

  @Column({ default: 'sms' })
  type: string; // sms, whatsapp, email
}
