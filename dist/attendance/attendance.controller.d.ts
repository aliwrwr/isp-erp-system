import { AttendancesService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
export declare class AttendancesController {
    private readonly attendancesService;
    constructor(attendancesService: AttendancesService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    findAll(): Promise<import("./entities/attendance.entity").Attendance[]>;
    findOne(id: string): Promise<import("./entities/attendance.entity").Attendance | null>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance | null>;
    remove(id: string): Promise<void>;
}
