import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
export declare class AttendancesService {
    private attendancesRepository;
    constructor(attendancesRepository: Repository<Attendance>);
    create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance>;
    findAll(): Promise<Attendance[]>;
    findOne(id: number): Promise<Attendance | null>;
    update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance | null>;
    remove(id: number): Promise<void>;
}
