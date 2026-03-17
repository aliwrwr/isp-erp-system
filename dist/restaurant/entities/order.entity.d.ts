import { RestaurantTable } from './restaurant-table.entity';
import { OrderItem } from './order-item.entity';
export declare class Order {
    id: number;
    orderNumber: string;
    table: RestaurantTable;
    items: OrderItem[];
    status: string;
    totalAmount: number;
    customerName: string;
    waiter: string;
    notes: string;
    orderType: string;
    createdAt: Date;
}
