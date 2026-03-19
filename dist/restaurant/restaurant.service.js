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
exports.RestaurantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_category_entity_1 = require("./entities/menu-category.entity");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const restaurant_table_entity_1 = require("./entities/restaurant-table.entity");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const reservation_entity_1 = require("./entities/reservation.entity");
const restaurant_expense_entity_1 = require("./entities/restaurant-expense.entity");
let RestaurantService = class RestaurantService {
    categoriesRepo;
    itemsRepo;
    tablesRepo;
    ordersRepo;
    orderItemsRepo;
    reservationsRepo;
    expensesRepo;
    constructor(categoriesRepo, itemsRepo, tablesRepo, ordersRepo, orderItemsRepo, reservationsRepo, expensesRepo) {
        this.categoriesRepo = categoriesRepo;
        this.itemsRepo = itemsRepo;
        this.tablesRepo = tablesRepo;
        this.ordersRepo = ordersRepo;
        this.orderItemsRepo = orderItemsRepo;
        this.reservationsRepo = reservationsRepo;
        this.expensesRepo = expensesRepo;
    }
    createCategory(dto) {
        return this.categoriesRepo.save(this.categoriesRepo.create(dto));
    }
    findAllCategories() {
        return this.categoriesRepo.find({ relations: ['items'] });
    }
    findOneCategory(id) {
        return this.categoriesRepo.findOne({ where: { id }, relations: ['items'] });
    }
    async updateCategory(id, dto) {
        await this.categoriesRepo.update(id, dto);
        return this.findOneCategory(id);
    }
    async removeCategory(id) {
        await this.itemsRepo.update({ category: { id } }, { category: null });
        await this.categoriesRepo.delete(id);
    }
    createItem(dto) {
        return this.itemsRepo.save(this.itemsRepo.create(dto));
    }
    findAllItems() {
        return this.itemsRepo.find({ relations: ['category'] });
    }
    findOneItem(id) {
        return this.itemsRepo.findOne({ where: { id }, relations: ['category'] });
    }
    async updateItem(id, dto) {
        await this.itemsRepo.update(id, dto);
        return this.findOneItem(id);
    }
    async removeItem(id) {
        await this.itemsRepo.delete(id);
    }
    createTable(dto) {
        return this.tablesRepo.save(this.tablesRepo.create(dto));
    }
    findAllTables() {
        return this.tablesRepo.find({ order: { number: 'ASC' } });
    }
    findOneTable(id) {
        return this.tablesRepo.findOne({ where: { id } });
    }
    async updateTable(id, dto) {
        await this.tablesRepo.update(id, dto);
        return this.findOneTable(id);
    }
    async removeTable(id) {
        await this.tablesRepo.delete(id);
    }
    async createOrder(dto) {
        const orderNumber = `ORD-${Date.now()}`;
        let totalAmount = 0;
        const orderItems = [];
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
        let table;
        const resolvedTableId = dto.tableId || (dto.table && (dto.table.id || dto.table));
        if (resolvedTableId) {
            const found = await this.tablesRepo.findOne({ where: { id: +resolvedTableId } });
            if (found)
                table = found;
        }
        const order = this.ordersRepo.create({
            orderNumber,
            totalAmount,
            customerName: dto.customerName,
            phone: dto.phone,
            address: dto.address,
            waiter: dto.waiter,
            notes: dto.notes,
            orderType: dto.orderType,
            table,
            items: orderItems,
        });
        const saved = await this.ordersRepo.save(order);
        if (table && dto.orderType !== 'takeaway' && dto.orderType !== 'delivery') {
            await this.tablesRepo.update(table.id, { status: 'occupied' });
        }
        return saved;
    }
    findAllOrders() {
        return this.ordersRepo.find({ relations: ['table', 'items', 'items.menuItem'], order: { createdAt: 'DESC' } });
    }
    findOneOrder(id) {
        return this.ordersRepo.findOne({ where: { id }, relations: ['table', 'items', 'items.menuItem'] });
    }
    async updateOrder(id, dto) {
        const order = await this.findOneOrder(id);
        if (!order)
            return null;
        if ((dto.status === 'paid' || dto.status === 'cancelled') && order.table) {
            await this.tablesRepo.update(order.table.id, { status: 'available' });
        }
        await this.ordersRepo.update(id, { status: dto.status, notes: dto.notes, waiter: dto.waiter });
        return this.findOneOrder(id);
    }
    async removeOrder(id) {
        const order = await this.findOneOrder(id);
        if (order?.table) {
            await this.tablesRepo.update(order.table.id, { status: 'available' });
        }
        await this.ordersRepo.delete(id);
    }
    createReservation(dto) {
        return this.reservationsRepo.save(this.reservationsRepo.create(dto));
    }
    findAllReservations() {
        return this.reservationsRepo.find({ relations: ['table'], order: { date: 'DESC', time: 'DESC' } });
    }
    findOneReservation(id) {
        return this.reservationsRepo.findOne({ where: { id }, relations: ['table'] });
    }
    async updateReservation(id, dto) {
        await this.reservationsRepo.update(id, dto);
        return this.findOneReservation(id);
    }
    async removeReservation(id) {
        await this.reservationsRepo.delete(id);
    }
    createExpense(dto) {
        const expense = this.expensesRepo.create(dto);
        if (!expense.date)
            expense.date = new Date().toISOString().split('T')[0];
        return this.expensesRepo.save(expense);
    }
    findAllExpenses() {
        return this.expensesRepo.find({ order: { createdAt: 'DESC' } });
    }
    findOneExpense(id) {
        return this.expensesRepo.findOne({ where: { id } });
    }
    async updateExpense(id, dto) {
        await this.expensesRepo.update(id, dto);
        return this.findOneExpense(id);
    }
    async removeExpense(id) {
        await this.expensesRepo.delete(id);
    }
};
exports.RestaurantService = RestaurantService;
exports.RestaurantService = RestaurantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_category_entity_1.MenuCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_table_entity_1.RestaurantTable)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(5, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(6, (0, typeorm_1.InjectRepository)(restaurant_expense_entity_1.RestaurantExpense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RestaurantService);
//# sourceMappingURL=restaurant.service.js.map