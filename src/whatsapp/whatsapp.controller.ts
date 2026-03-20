import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsappService } from './whatsapp.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { UpdateWhatsappSettingsDto } from './dto/update-settings.dto';
import { UpdateInstallmentsSettingsDto } from './dto/update-installments-settings.dto';
import { UpdateSupportSettingsDto } from './dto/update-support-settings.dto';
import { SendTestMessageDto } from './dto/send-test.dto';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly scheduler: NotificationSchedulerService,
  ) {}

  /** Connection status + QR code */
  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  /** Initialize / reconnect the WhatsApp client */
  @Post('connect')
  async connect() {
    await this.whatsappService.initializeClient();
    return { message: 'تم بدء تهيئة الاتصال' };
  }

  /** Logout and disconnect */
  @Post('disconnect')
  async disconnect() {
    await this.whatsappService.disconnect();
    return { message: 'تم قطع الاتصال' };
  }

  /** Change WhatsApp device — clears session and generates new QR */
  @Post('change-device')
  async changeDevice() {
    await this.whatsappService.changeDevice();
    return { message: 'تم مسح الجلسة — امسح رمز QR لربط جهاز جديد' };
  }

  /** Send a test message */
  @Post('send-test')
  async sendTest(@Body() dto: SendTestMessageDto) {
    const sent = await this.whatsappService.sendMessage(dto.phone, dto.message);
    return {
      success: sent,
      message: sent ? 'تم إرسال الرسالة بنجاح' : 'فشل الإرسال — تأكد من الاتصال',
    };
  }

  /** Get notification settings */
  @Get('settings')
  getSettings() {
    return this.whatsappService.getSettings();
  }

  /** Update notification settings */
  @Patch('settings')
  updateSettings(@Body() dto: UpdateWhatsappSettingsDto) {
    return this.whatsappService.updateSettings(dto);
  }

  /** Get list of subscribers expiring soon */
  @Get('expiring')
  getExpiring(@Query('days') days?: string) {
    return this.scheduler.getExpiringSoon(days ? parseInt(days, 10) : 7);
  }

  /** Manually trigger notifications for today */
  @Post('send-now')
  sendNow() {
    return this.scheduler.sendNowForDate();
  }

  /** Send a direct custom message to a specific subscriber */
  @Post('send-direct')
  async sendDirect(@Body() dto: SendTestMessageDto) {
    const sent = await this.whatsappService.sendMessage(dto.phone, dto.message);
    return {
      success: sent,
      message: sent ? 'تم إرسال الرسالة بنجاح' : 'فشل الإرسال — تأكد من اتصال واتساب',
    };
  }

  /** Get WhatsApp message log */
  @Get('logs')
  getLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.whatsappService.getLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /** Get WhatsApp message stats */
  @Get('stats')
  getStats() {
    return this.whatsappService.getStats();
  }

  // ── Installments Settings ─────────────────────────────────────────────────

  @Get('settings-installments')
  getInstallmentsSettings() {
    return this.whatsappService.getInstallmentsSettings();
  }

  @Patch('settings-installments')
  updateInstallmentsSettings(@Body() dto: UpdateInstallmentsSettingsDto) {
    return this.whatsappService.updateInstallmentsSettings(dto);
  }

  // ── Support Settings ──────────────────────────────────────────────────────

  @Get('settings-support')
  getSupportSettings() {
    return this.whatsappService.getSupportSettings();
  }

  @Patch('settings-support')
  updateSupportSettings(@Body() dto: UpdateSupportSettingsDto) {
    return this.whatsappService.updateSupportSettings(dto);
  }
}
