import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { RestaurantTable } from './entities/restaurant-table.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Reservation } from './entities/reservation.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { RestaurantExpense } from './entities/restaurant-expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(MenuCategory) private categoriesRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private itemsRepo: Repository<MenuItem>,
    @InjectRepository(RestaurantTable) private tablesRepo: Repository<RestaurantTable>,
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(Reservation) private reservationsRepo: Repository<Reservation>,
    @InjectRepository(RestaurantExpense) private expensesRepo: Repository<RestaurantExpense>,
  ) {}

  // Menu Categories
  createCategory(dto: CreateMenuCategoryDto) {
    return this.categoriesRepo.save(this.categoriesRepo.create(dto));
  }
  findAllCategories() {
    return this.categoriesRepo.find({ relations: ['items'] });
  }
  findOneCategory(id: number) {
    return this.categoriesRepo.findOne({ where: { id }, relations: ['items'] });
  }
  async updateCategory(id: number, dto: UpdateMenuCategoryDto) {
    await this.categoriesRepo.update(id, dto);
    return this.findOneCategory(id);
  }
  async removeCategory(id: number) {
    await this.itemsRepo.update({ category: { id } }, { category: null } as any);
    await this.categoriesRepo.delete(id);
  }

  // Menu Items
  createItem(dto: CreateMenuItemDto) {
    return this.itemsRepo.save(this.itemsRepo.create(dto));
  }
  findAllItems() {
    return this.itemsRepo.find({ relations: ['category'] });
  }
  findOneItem(id: number) {
    return this.itemsRepo.findOne({ where: { id }, relations: ['category'] });
  }
  async updateItem(id: number, dto: UpdateMenuItemDto) {
    await this.itemsRepo.update(id, dto);
    return this.findOneItem(id);
  }
  async removeItem(id: number) {
    await this.itemsRepo.delete(id);
  }

  // Tables
  createTable(dto: CreateTableDto) {
    return this.tablesRepo.save(this.tablesRepo.create(dto));
  }
  findAllTables() {
    return this.tablesRepo.find({ order: { number: 'ASC' } });
  }
  findOneTable(id: number) {
    return this.tablesRepo.findOne({ where: { id } });
  }
  async updateTable(id: number, dto: UpdateTableDto) {
    await this.tablesRepo.update(id, dto);
    return this.findOneTable(id);
  }
  async removeTable(id: number) {
    await this.tablesRepo.delete(id);
  }

  // Orders
  async createOrder(dto: CreateOrderDto) {
    const orderNumber = `ORD-${Date.now()}`;
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        const menuItem = await this.itemsRepo.findOne({ where: { id: item.menuItemId } });
        if (menuItem) {
          const oi = this.orderItemsRepo.create({
            menuItem,
            quantity: item.quantity || 1,
            price: menuItem.price,
            notes: item.notes || null,
          });
          totalAmount += Number(menuItem.price) * (item.quantity || 1);
          orderItems.push(oi);
        }
      }
    }
    // Resolve table from tableId or table object
    let table: RestaurantTable | undefined;
    const resolvedTableId = dto.tableId || (dto.table && (dto.table.id || dto.table));
    if (resolvedTableId) {
      const found = await this.tablesRepo.findOne({ where: { id: +resolvedTableId } });
      if (found) table = found;
    }
    const order = this.ordersRepo.create({
      orderNumber,
      totalAmount,
      customerName: dto.customerName,
      waiter: dto.waiter,
      notes: dto.notes,
      orderType: dto.orderType,
      table,
      items: orderItems,
    });
    const saved = await this.ordersRepo.save(order);
    // Update table status if dine-in
    if (table && dto.orderType !== 'takeaway' && dto.orderType !== 'delivery') {
      await this.tablesRepo.update(table.id, { status: 'occupied' });
    }
    return saved;
  }
  findAllOrders() {
    return this.ordersRepo.find({ relations: ['table', 'items', 'items.menuItem'], order: { createdAt: 'DESC' } });
  }
  findOneOrder(id: number) {
    return this.ordersRepo.findOne({ where: { id }, relations: ['table', 'items', 'items.menuItem'] });
  }
  async updateOrder(id: number, dto: UpdateOrderDto) {
    const order = await this.findOneOrder(id);
    if (!order) return null;
    // If changing to paid/cancelled, free the table
    if ((dto.status === 'paid' || dto.status === 'cancelled') && order.table) {
      await this.tablesRepo.update(order.table.id, { status: 'available' });
    }
    await this.ordersRepo.update(id, { status: dto.status, notes: dto.notes, waiter: dto.waiter });
    return this.findOneOrder(id);
  }
  async removeOrder(id: number) {
    const order = await this.findOneOrder(id);
    if (order?.table) {
      await this.tablesRepo.update(order.table.id, { status: 'available' });
    }
    await this.ordersRepo.delete(id);
  }

  // Reservations
  createReservation(dto: CreateReservationDto) {
    return this.reservationsRepo.save(this.reservationsRepo.create(dto));
  }
  findAllReservations() {
    return this.reservationsRepo.find({ relations: ['table'], order: { date: 'DESC', time: 'DESC' } });
  }
  findOneReservation(id: number) {
    return this.reservationsRepo.findOne({ where: { id }, relations: ['table'] });
  }
  async updateReservation(id: number, dto: UpdateReservationDto) {
    await this.reservationsRepo.update(id, dto);
    return this.findOneReservation(id);
  }
  async removeReservation(id: number) {
    await this.reservationsRepo.delete(id);
  }

  // Expenses
  createExpense(dto: CreateExpenseDto) {
    const expense = this.expensesRepo.create(dto);
    if (!expense.date) expense.date = new Date().toISOString().split('T')[0];
    return this.expensesRepo.save(expense);
  }
  findAllExpenses() {
    return this.expensesRepo.find({ order: { createdAt: 'DESC' } });
  }
  findOneExpense(id: number) {
    return this.expensesRepo.findOne({ where: { id } });
  }
  async updateExpense(id: number, dto: UpdateExpenseDto) {
    await this.expensesRepo.update(id, dto);
    return this.findOneExpense(id);
  }
  async removeExpense(id: number) {
    await this.expensesRepo.delete(id);
  }
}
