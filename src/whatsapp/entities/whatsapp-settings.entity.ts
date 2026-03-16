import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('whatsapp_settings')
export class WhatsappSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  activationEnabled: boolean;

  @Column({ default: false })
  expiryWarningEnabled: boolean;

  @Column({ default: false })
  expiryEnabled: boolean;

  @Column({ default: 3 })
  warningDays: number;

  @Column('text', {
    default:
      'مرحباً {{name}} 👋\nتم تفعيل اشتراكك في خدمة الإنترنت بنجاح ✅\n📦 الباقة: {{package}}\n📅 تاريخ الانتهاء: {{endDate}}\nللاستفسار تواصل معنا.',
  })
  activationTemplate: string;

  @Column('text', {
    default:
      'عزيزي {{name}} ⚠️\nاشتراكك في خدمة الإنترنت سينتهي خلال {{days}} أيام 📅\nتاريخ الانتهاء: {{endDate}}\nيرجى التجديد للاستمرار في الاستمتاع بالخدمة.',
  })
  expiryWarningTemplate: string;

  @Column('text', {
    default:
      'عزيزي {{name}} 🔴\nاشتراكك في خدمة الإنترنت قد انتهى اليوم.\nيرجى التجديد لاستئناف الخدمة. تواصل معنا.',
  })
  expiryTemplate: string;
}
