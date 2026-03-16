import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private attendancesRepository: Repository<Attendance>,
  ) {}

  create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendancesRepository.create(createAttendanceDto);
    return this.attendancesRepository.save(attendance);
  }

  findAll(): Promise<Attendance[]> {
    return this.attendancesRepository.find({ relations: ['employee'] });
  }

  findOne(id: number): Promise<Attendance | null> {
    return this.attendancesRepository.findOne({ where: { id }, relations: ['employee'] });
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance | null> {
    await this.attendancesRepository.update(id, updateAttendanceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.attendancesRepository.delete(id);
  }
}
