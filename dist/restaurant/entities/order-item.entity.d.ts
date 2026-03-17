import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';
export declare class OrderItem {
    id: number;
    order: Order;
    menuItem: MenuItem;
    quantity: number;
    price: number;
    notes: string;
    status: string;
}
