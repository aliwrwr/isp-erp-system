import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesService {
    private expensesRepository;
    constructor(expensesRepository: Repository<Expense>);
    create(createExpenseDto: CreateExpenseDto): Promise<Expense>;
    findAll(): Promise<Expense[]>;
    findOne(id: number): Promise<Expense | null>;
    update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense | null>;
    remove(id: number): Promise<void>;
}
