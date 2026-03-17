import { RestaurantTable } from './restaurant-table.entity';
export declare class Reservation {
    id: number;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    guests: number;
    table: RestaurantTable;
    status: string;
    notes: string;
    createdAt: Date;
}
