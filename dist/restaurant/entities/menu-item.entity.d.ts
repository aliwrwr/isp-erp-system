import { MenuCategory } from './menu-category.entity';
export declare class MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    cost: number;
    category: MenuCategory;
    available: boolean;
    preparationTime: number;
    image: string;
}
