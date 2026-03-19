import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  companyName: string;

  @Column({ default: '' })
  companyPhone: string;

  @Column({ default: '' })
  companyEmail: string;

  @Column({ default: '' })
  companyAddress: string;

  @Column('text', { default: '' })
  logoBase64: string;

  @Column({ default: 30 })
  defaultDuration: number;

  @Column({ default: 5 })
  expiryWarningDays: number;

  @Column({ default: 'IQD' })
  currency: string;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: true })
  notifyExpiry: boolean;

  @Column({ default: true })
  notifyNewSub: boolean;

  @Column({ default: true })
  notifyDebt: boolean;

  @Column({ default: 25 })
  pageSize: number;

  @Column({ default: 'YYYY-MM-DD' })
  dateFormat: string;

  @Column({ default: true })
  showExpired: boolean;

  // ── Restaurant-specific settings ──────────────────────────
  @Column({ default: '' })
  restaurantName: string;

  @Column({ default: '' })
  restaurantPhone: string;

  @Column('text', { default: '' })
  restaurantAddress: string;

  @Column('text', { default: '' })
  restaurantLogoBase64: string;

  @Column({ default: '80mm' })
  receiptPaperSize: string; // '80mm' | '58mm'

  @Column({ default: 'د.ع' })
  receiptCurrency: string;

  @Column({ default: false })
  taxEnabled: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ default: 'شكراً لزيارتكم 🙏' })
  receiptFooter: string;
}
