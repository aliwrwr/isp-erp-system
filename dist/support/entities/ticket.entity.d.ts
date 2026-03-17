import { Subscriber } from '../../subscribers/entities/subscriber.entity';
import { Employee } from '../../employees/entities/employee.entity';
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in-progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum TicketType {
    INTERNET = "internet",
    HARDWARE = "hardware",
    BILLING = "billing",
    ACCOUNT = "account",
    OTHER = "other"
}
export declare class Ticket {
    id: number;
    subject: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    type: TicketType;
    subscriberId: number;
    subscriber: Subscriber;
    assignedToId: number;
    assignedTo: Employee;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date;
    notes: string;
}
