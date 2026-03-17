import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<import("./entities/department.entity").Department>;
    findAll(req: any): Promise<import("./entities/department.entity").Department[]>;
    findOne(id: string, req: any): Promise<import("./entities/department.entity").Department | null>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<import("./entities/department.entity").Department | null>;
    remove(id: string): Promise<void>;
}
