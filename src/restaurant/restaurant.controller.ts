import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Restaurant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ========== Menu Categories ==========
  @Post('categories')
  @Permissions('restaurant.menu')
  createCategory(@Body() dto: CreateMenuCategoryDto) {
    return this.restaurantService.createCategory(dto);
  }

  @Get('categories')
  @Permissions('restaurant.menu')
  findAllCategories() {
    return this.restaurantService.findAllCategories();
  }

  @Get('categories/:id')
  @Permissions('restaurant.menu')
  findOneCategory(@Param('id') id: string) {
    return this.restaurantService.findOneCategory(+id);
  }

  @Patch('categories/:id')
  @Permissions('restaurant.menu')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateMenuCategoryDto) {
    return this.restaurantService.updateCategory(+id, dto);
  }

  @Delete('categories/:id')
  @Permissions('restaurant.menu')
  removeCategory(@Param('id') id: string) {
    return this.restaurantService.removeCategory(+id);
  }

  // ========== Menu Items ==========
  @Post('menu')
  @Permissions('restaurant.menu')
  createItem(@Body() dto: CreateMenuItemDto) {
    return this.restaurantService.createItem(dto);
  }

  @Get('menu')
  @Permissions('restaurant.menu')
  findAllItems() {
    return this.restaurantService.findAllItems();
  }

  @Get('menu/:id')
  @Permissions('restaurant.menu')
  findOneItem(@Param('id') id: string) {
    return this.restaurantService.findOneItem(+id);
  }

  @Patch('menu/:id')
  @Permissions('restaurant.menu')
  updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.restaurantService.updateItem(+id, dto);
  }

  @Delete('menu/:id')
  @Permissions('restaurant.menu')
  removeItem(@Param('id') id: string) {
    return this.restaurantService.removeItem(+id);
  }

  // ========== Tables ==========
  @Post('tables')
  @Permissions('restaurant.tables')
  createTable(@Body() dto: CreateTableDto) {
    return this.restaurantService.createTable(dto);
  }

  @Get('tables')
  @Permissions('restaurant.tables')
  findAllTables() {
    return this.restaurantService.findAllTables();
  }

  @Get('tables/:id')
  @Permissions('restaurant.tables')
  findOneTable(@Param('id') id: string) {
    return this.restaurantService.findOneTable(+id);
  }

  @Patch('tables/:id')
  @Permissions('restaurant.tables')
  updateTable(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.restaurantService.updateTable(+id, dto);
  }

  @Delete('tables/:id')
  @Permissions('restaurant.tables')
  removeTable(@Param('id') id: string) {
    return this.restaurantService.removeTable(+id);
  }

  // ========== Orders ==========
  @Post('orders')
  @Permissions('restaurant.orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.restaurantService.createOrder(dto);
  }

  @Get('orders')
  @Permissions('restaurant.orders')
  findAllOrders() {
    return this.restaurantService.findAllOrders();
  }

  @Get('orders/:id')
  @Permissions('restaurant.orders')
  findOneOrder(@Param('id') id: string) {
    return this.restaurantService.findOneOrder(+id);
  }

  @Patch('orders/:id')
  @Permissions('restaurant.orders')
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.restaurantService.updateOrder(+id, dto);
  }

  @Delete('orders/:id')
  @Permissions('restaurant.orders')
  removeOrder(@Param('id') id: string) {
    return this.restaurantService.removeOrder(+id);
  }

  // ========== Kitchen ==========
  @Get('kitchen')
  @Permissions('restaurant.kitchen')
  findKitchenOrders() {
    return this.restaurantService.findAllOrders();
  }

  // ========== Reservations ==========
  @Post('reservations')
  @Permissions('restaurant.reservations')
  createReservation(@Body() dto: CreateReservationDto) {
    return this.restaurantService.createReservation(dto);
  }

  @Get('reservations')
  @Permissions('restaurant.reservations')
  findAllReservations() {
    return this.restaurantService.findAllReservations();
  }

  @Get('reservations/:id')
  @Permissions('restaurant.reservations')
  findOneReservation(@Param('id') id: string) {
    return this.restaurantService.findOneReservation(+id);
  }

  @Patch('reservations/:id')
  @Permissions('restaurant.reservations')
  updateReservation(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.restaurantService.updateReservation(+id, dto);
  }

  @Delete('reservations/:id')
  @Permissions('restaurant.reservations')
  removeReservation(@Param('id') id: string) {
    return this.restaurantService.removeReservation(+id);
  }

  // ========== Expenses ==========
  @Post('expenses')
  @Permissions('restaurant.expenses')
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.restaurantService.createExpense(dto);
  }

  @Get('expenses')
  @Permissions('restaurant.expenses')
  findAllExpenses() {
    return this.restaurantService.findAllExpenses();
  }

  @Get('expenses/:id')
  @Permissions('restaurant.expenses')
  findOneExpense(@Param('id') id: string) {
    return this.restaurantService.findOneExpense(+id);
  }

  @Patch('expenses/:id')
  @Permissions('restaurant.expenses')
  updateExpense(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.restaurantService.updateExpense(+id, dto);
  }

  @Delete('expenses/:id')
  @Permissions('restaurant.expenses')
  removeExpense(@Param('id') id: string) {
    return this.restaurantService.removeExpense(+id);
  }

  // ========== Reports ==========
  @Get('reports/summary')
  @Permissions('restaurant.reports')
  async getReportsSummary(@Query('from') from?: string, @Query('to') to?: string) {
    const orders = await this.restaurantService.findAllOrders();
    const expenses = await this.restaurantService.findAllExpenses();
    const today = new Date().toISOString().split('T')[0];

    // Date range filter
    const dateFrom = from || null;
    const dateTo = to || null;

    const inRange = (dateStr: string) => {
      if (!dateStr) return false;
      const d = dateStr.split('T')[0];
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    };

    const filteredOrders = (dateFrom || dateTo)
      ? orders.filter(o => o.createdAt && inRange(new Date(o.createdAt).toISOString()))
      : orders;
    const filteredExpenses = (dateFrom || dateTo)
      ? expenses.filter(e => inRange(e.date))
      : expenses;

    const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today);
    const paidOrders = filteredOrders.filter(o => o.status === 'paid');
    const todayPaid = todayOrders.filter(o => o.status === 'paid');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const todayRevenue = todayPaid.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const todayExpenses = expenses.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.amount), 0);

    // Daily breakdown — use range days or last 30 days
    const dailyData: { date: string; revenue: number; expenses: number; orders: number }[] = [];
    const rangeStart = dateFrom ? new Date(dateFrom) : (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d; })();
    const rangeEnd = dateTo ? new Date(dateTo) : new Date();
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === ds && o.status === 'paid');
      const dayExpenses = expenses.filter(e => e.date === ds);
      dailyData.push({
        date: ds,
        revenue: dayOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
        expenses: dayExpenses.reduce((s, e) => s + Number(e.amount), 0),
        orders: dayOrders.length,
      });
    }

    // Expense breakdown by category
    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
    });

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    paidOrders.forEach(o => {
      o.items?.forEach(item => {
        const name = item.menuItem?.name || 'Unknown';
        if (!itemSales[name]) itemSales[name] = { name, quantity: 0, revenue: 0 };
        itemSales[name].quantity += item.quantity;
        itemSales[name].revenue += Number(item.price) * item.quantity;
      });
    });
    const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return {
      totalOrders: filteredOrders.length,
      todayOrders: todayOrders.length,
      paidOrders: paidOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      todayRevenue,
      totalExpenses,
      todayExpenses,
      netProfit: totalRevenue - totalExpenses,
      todayProfit: todayRevenue - todayExpenses,
      dailyData,
      expensesByCategory,
      topItems,
    };
  }
}
