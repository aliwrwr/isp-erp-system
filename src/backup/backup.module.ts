import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
