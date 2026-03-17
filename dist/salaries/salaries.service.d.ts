import { Repository } from 'typeorm';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary } from './entities/salary.entity';
export declare class SalariesService {
    private salariesRepository;
    constructor(salariesRepository: Repository<Salary>);
    create(createSalaryDto: CreateSalaryDto): Promise<Salary>;
    findAll(): Promise<Salary[]>;
    findOne(id: number): Promise<Salary | null>;
    update(id: number, updateSalaryDto: UpdateSalaryDto): Promise<Salary | null>;
    remove(id: number): Promise<void>;
}
