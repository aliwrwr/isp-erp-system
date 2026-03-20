import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('whatsapp_installments_settings')
export class WhatsappInstallmentsSettings {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Payment Due Reminder ──────────────────────────────────────────────────
  @Column({ default: false })
  paymentDueEnabled: boolean;

  @Column({ default: 3 })
  warningDays: number;

  @Column('text', {
    default:
      'عزيزي {{name}} ⚠️\nقسطك بمبلغ {{amount}} د.ع يستحق الدفع خلال {{days}} أيام\nتاريخ الاستحقاق: {{dueDate}}\nرقم العقد: {{contract}}\nيرجى الحضور لسداد القسط في الوقت المحدد.',
  })
  paymentDueTemplate: string;

  // ── Overdue Payment ───────────────────────────────────────────────────────
  @Column({ default: false })
  overdueEnabled: boolean;

  @Column('text', {
    default:
      'عزيزي {{name}} 🔴\nتأخرت في سداد قسطك بمبلغ {{amount}} د.ع\nتاريخ الاستحقاق كان: {{dueDate}}\nرقم العقد: {{contract}}\nيرجى الحضور لسداد القسط في أقرب وقت.',
  })
  overdueTemplate: string;

  // ── Payment Received Confirmation ─────────────────────────────────────────
  @Column({ default: false })
  paymentReceivedEnabled: boolean;

  @Column('text', {
    default:
      'عزيزي {{name}} ✅\nتم استلام دفعتك بمبلغ {{amount}} د.ع بنجاح\nرقم العقد: {{contract}}\nرقم القسط: {{installmentNo}}\nالمتبقي من العقد: {{remaining}} د.ع\nشكراً لالتزامك.',
  })
  paymentReceivedTemplate: string;
}
