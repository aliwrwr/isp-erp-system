import { Role } from './role.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    roles: Role[];
    invoices: Invoice[];
    createdAt: Date;
    updatedAt: Date;
}
