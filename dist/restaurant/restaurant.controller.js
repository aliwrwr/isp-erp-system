"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantController = void 0;
const common_1 = require("@nestjs/common");
const restaurant_service_1 = require("./restaurant.service");
const create_menu_category_dto_1 = require("./dto/create-menu-category.dto");
const update_menu_category_dto_1 = require("./dto/update-menu-category.dto");
const create_menu_item_dto_1 = require("./dto/create-menu-item.dto");
const update_menu_item_dto_1 = require("./dto/update-menu-item.dto");
const create_table_dto_1 = require("./dto/create-table.dto");
const update_table_dto_1 = require("./dto/update-table.dto");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const create_reservation_dto_1 = require("./dto/create-reservation.dto");
const update_reservation_dto_1 = require("./dto/update-reservation.dto");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const update_expense_dto_1 = require("./dto/update-expense.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let RestaurantController = class RestaurantController {
    restaurantService;
    constructor(restaurantService) {
        this.restaurantService = restaurantService;
    }
    createCategory(dto) {
        return this.restaurantService.createCategory(dto);
    }
    findAllCategories() {
        return this.restaurantService.findAllCategories();
    }
    findOneCategory(id) {
        return this.restaurantService.findOneCategory(+id);
    }
    updateCategory(id, dto) {
        return this.restaurantService.updateCategory(+id, dto);
    }
    removeCategory(id) {
        return this.restaurantService.removeCategory(+id);
    }
    createItem(dto) {
        return this.restaurantService.createItem(dto);
    }
    findAllItems() {
        return this.restaurantService.findAllItems();
    }
    findOneItem(id) {
        return this.restaurantService.findOneItem(+id);
    }
    updateItem(id, dto) {
        return this.restaurantService.updateItem(+id, dto);
    }
    removeItem(id) {
        return this.restaurantService.removeItem(+id);
    }
    createTable(dto) {
        return this.restaurantService.createTable(dto);
    }
    findAllTables() {
        return this.restaurantService.findAllTables();
    }
    findOneTable(id) {
        return this.restaurantService.findOneTable(+id);
    }
    updateTable(id, dto) {
        return this.restaurantService.updateTable(+id, dto);
    }
    removeTable(id) {
        return this.restaurantService.removeTable(+id);
    }
    createOrder(dto) {
        return this.restaurantService.createOrder(dto);
    }
    findAllOrders() {
        return this.restaurantService.findAllOrders();
    }
    findOneOrder(id) {
        return this.restaurantService.findOneOrder(+id);
    }
    updateOrder(id, dto) {
        return this.restaurantService.updateOrder(+id, dto);
    }
    removeOrder(id) {
        return this.restaurantService.removeOrder(+id);
    }
    findKitchenOrders() {
        return this.restaurantService.findAllOrders();
    }
    createReservation(dto) {
        return this.restaurantService.createReservation(dto);
    }
    findAllReservations() {
        return this.restaurantService.findAllReservations();
    }
    findOneReservation(id) {
        return this.restaurantService.findOneReservation(+id);
    }
    updateReservation(id, dto) {
        return this.restaurantService.updateReservation(+id, dto);
    }
    removeReservation(id) {
        return this.restaurantService.removeReservation(+id);
    }
    createExpense(dto) {
        return this.restaurantService.createExpense(dto);
    }
    findAllExpenses() {
        return this.restaurantService.findAllExpenses();
    }
    findOneExpense(id) {
        return this.restaurantService.findOneExpense(+id);
    }
    updateExpense(id, dto) {
        return this.restaurantService.updateExpense(+id, dto);
    }
    removeExpense(id) {
        return this.restaurantService.removeExpense(+id);
    }
    async getReportsSummary() {
        const orders = await this.restaurantService.findAllOrders();
        const expenses = await this.restaurantService.findAllExpenses();
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === today);
        const paidOrders = orders.filter(o => o.status === 'paid');
        const todayPaid = todayOrders.filter(o => o.status === 'paid');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const todayRevenue = todayPaid.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const todayExpenses = expenses.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.amount), 0);
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
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
        const expensesByCategory = {};
        expenses.forEach(e => {
            expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
        });
        const itemSales = {};
        paidOrders.forEach(o => {
            o.items?.forEach(item => {
                const name = item.menuItem?.name || 'Unknown';
                if (!itemSales[name])
                    itemSales[name] = { name, quantity: 0, revenue: 0 };
                itemSales[name].quantity += item.quantity;
                itemSales[name].revenue += Number(item.price) * item.quantity;
            });
        });
        const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        return {
            totalOrders: orders.length,
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
};
exports.RestaurantController = RestaurantController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_category_dto_1.CreateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_category_dto_1.UpdateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Post)('menu'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_item_dto_1.CreateMenuItemDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('menu'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllItems", null);
__decorate([
    (0, common_1.Get)('menu/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneItem", null);
__decorate([
    (0, common_1.Patch)('menu/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_item_dto_1.UpdateMenuItemDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('menu/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.menu'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Post)('tables'),
    (0, permissions_decorator_1.Permissions)('restaurant.tables'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_table_dto_1.CreateTableDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createTable", null);
__decorate([
    (0, common_1.Get)('tables'),
    (0, permissions_decorator_1.Permissions)('restaurant.tables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllTables", null);
__decorate([
    (0, common_1.Get)('tables/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.tables'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneTable", null);
__decorate([
    (0, common_1.Patch)('tables/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.tables'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_table_dto_1.UpdateTableDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateTable", null);
__decorate([
    (0, common_1.Delete)('tables/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.tables'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeTable", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, permissions_decorator_1.Permissions)('restaurant.orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, permissions_decorator_1.Permissions)('restaurant.orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.orders'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.orders'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.orders'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeOrder", null);
__decorate([
    (0, common_1.Get)('kitchen'),
    (0, permissions_decorator_1.Permissions)('restaurant.kitchen'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findKitchenOrders", null);
__decorate([
    (0, common_1.Post)('reservations'),
    (0, permissions_decorator_1.Permissions)('restaurant.reservations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_dto_1.CreateReservationDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Get)('reservations'),
    (0, permissions_decorator_1.Permissions)('restaurant.reservations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllReservations", null);
__decorate([
    (0, common_1.Get)('reservations/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.reservations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneReservation", null);
__decorate([
    (0, common_1.Patch)('reservations/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.reservations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reservation_dto_1.UpdateReservationDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateReservation", null);
__decorate([
    (0, common_1.Delete)('reservations/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.reservations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeReservation", null);
__decorate([
    (0, common_1.Post)('expenses'),
    (0, permissions_decorator_1.Permissions)('restaurant.expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)('expenses'),
    (0, permissions_decorator_1.Permissions)('restaurant.expenses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findAllExpenses", null);
__decorate([
    (0, common_1.Get)('expenses/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.expenses'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "findOneExpense", null);
__decorate([
    (0, common_1.Patch)('expenses/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.expenses'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_dto_1.UpdateExpenseDto]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "updateExpense", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    (0, permissions_decorator_1.Permissions)('restaurant.expenses'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantController.prototype, "removeExpense", null);
__decorate([
    (0, common_1.Get)('reports/summary'),
    (0, permissions_decorator_1.Permissions)('restaurant.reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestaurantController.prototype, "getReportsSummary", null);
exports.RestaurantController = RestaurantController = __decorate([
    (0, swagger_1.ApiTags)('Restaurant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('restaurant'),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService])
], RestaurantController);
//# sourceMappingURL=restaurant.controller.js.map