import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('whatsapp_support_settings')
export class WhatsappSupportSettings {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Ticket Created ────────────────────────────────────────────────────────
  @Column({ default: false })
  ticketCreatedEnabled: boolean;

  @Column('text', {
    default:
      'مرحباً {{name}} 👋\nتم استلام طلب الدعم الفني رقم #{{ticketId}}\nالموضوع: {{description}}\nسيتم التواصل معك في أقرب وقت.',
  })
  ticketCreatedTemplate: string;

  // ── Ticket Resolved ───────────────────────────────────────────────────────
  @Column({ default: false })
  ticketResolvedEnabled: boolean;

  @Column('text', {
    default:
      'مرحباً {{name}} ✅\nتم حل طلب الدعم الفني رقم #{{ticketId}} بنجاح\nنأمل أن تكون الخدمة مرضية. للاستفسار تواصل معنا.',
  })
  ticketResolvedTemplate: string;

  // ── Tech Assigned ─────────────────────────────────────────────────────────
  @Column({ default: false })
  techAssignedEnabled: boolean;

  @Column('text', {
    default:
      'مرحباً {{name}} 🔧\nتم تعيين الفني {{techName}} لمعالجة طلبك رقم #{{ticketId}}\nسيتواصل معك قريباً.',
  })
  techAssignedTemplate: string;
}
