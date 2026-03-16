import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Messages
  @Post('messages')
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagingService.createMessage(createMessageDto);
  }

  @Get('messages')
  findAllMessages() {
    return this.messagingService.findAllMessages();
  }

  @Get('messages/:id')
  findOneMessage(@Param('id') id: string) {
    return this.messagingService.findOneMessage(+id);
  }

  @Delete('messages/:id')
  removeMessage(@Param('id') id: string) {
    return this.messagingService.removeMessage(+id);
  }

  // Templates
  @Post('templates')
  createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.messagingService.createTemplate(createTemplateDto);
  }

  @Get('templates')
  findAllTemplates() {
    return this.messagingService.findAllTemplates();
  }

  @Get('templates/:id')
  findOneTemplate(@Param('id') id: string) {
    return this.messagingService.findOneTemplate(+id);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.messagingService.updateTemplate(+id, updateTemplateDto);
  }

  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string) {
    return this.messagingService.removeTemplate(+id);
  }
}
