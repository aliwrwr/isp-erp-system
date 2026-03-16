import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageTemplate])],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService, TypeOrmModule],
})
export class MessagingModule {}
