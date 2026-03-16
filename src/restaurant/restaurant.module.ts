import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { RestaurantTable } from './entities/restaurant-table.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Reservation } from './entities/reservation.entity';
import { RestaurantExpense } from './entities/restaurant-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuCategory,
      MenuItem,
      RestaurantTable,
      Order,
      OrderItem,
      Reservation,
      RestaurantExpense,
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [TypeOrmModule],
})
export class RestaurantModule {}
