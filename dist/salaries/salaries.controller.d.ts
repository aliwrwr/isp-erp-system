import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
export declare class SalariesController {
    private readonly salariesService;
    constructor(salariesService: SalariesService);
    create(createSalaryDto: CreateSalaryDto): Promise<import("./entities/salary.entity").Salary>;
    findAll(): Promise<import("./entities/salary.entity").Salary[]>;
    findOne(id: string): Promise<import("./entities/salary.entity").Salary | null>;
    update(id: string, updateSalaryDto: UpdateSalaryDto): Promise<import("./entities/salary.entity").Salary | null>;
    remove(id: string): Promise<void>;
}
