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

  /** Get WhatsApp message log */
  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    return this.whatsappService.getLogs(limit ? parseInt(limit, 10) : 100);
  }
}
