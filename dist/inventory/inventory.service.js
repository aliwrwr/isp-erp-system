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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_movement_entity_1 = require("./entities/inventory-movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
let InventoryService = class InventoryService {
    movementsRepository;
    productsRepository;
    dataSource;
    constructor(movementsRepository, productsRepository, dataSource) {
        this.movementsRepository = movementsRepository;
        this.productsRepository = productsRepository;
        this.dataSource = dataSource;
    }
    async create(dto) {
        const movement = this.movementsRepository.create(dto);
        const saved = await this.movementsRepository.save(movement);
        const productId = dto.product?.id ?? dto.product;
        if (productId) {
            const product = await this.productsRepository.findOne({ where: { id: Number(productId) } });
            if (product) {
                if (dto.type === 'in') {
                    product.stock = (product.stock || 0) + dto.quantity;
                }
                else if (dto.type === 'out') {
                    product.stock = Math.max(0, (product.stock || 0) - dto.quantity);
                }
                else {
                    product.stock = dto.quantity;
                }
                await this.productsRepository.save(product);
            }
        }
        return saved;
    }
    findAll() {
        return this.movementsRepository.find({ relations: ['product'], order: { date: 'DESC' } });
    }
    findOne(id) {
        return this.movementsRepository.findOne({ where: { id }, relations: ['product'] });
    }
    async remove(id) {
        await this.movementsRepository.delete(id);
    }
    async getStats() {
        const products = await this.productsRepository.find();
        const total = products.length;
        const inStock = products.filter(p => (p.stock || 0) > 5).length;
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
        const totalCostValue = products.reduce((s, p) => s + (p.stock || 0) * Number(p.cost || 0), 0);
        const totalRetailValue = products.reduce((s, p) => s + (p.stock || 0) * Number(p.price || 0), 0);
        return { total, inStock, lowStock, outOfStock, totalCostValue, totalRetailValue };
    }
    async getStockSummary() {
        const products = await this.productsRepository.find({ relations: ['category'] });
        let soldMap = new Map();
        try {
            const soldRows = await this.dataSource.query(`SELECT productId, SUM(quantity) as totalSold, SUM(quantity * price) as totalRevenue
         FROM invoice_items WHERE productId IS NOT NULL GROUP BY productId`);
            soldMap = new Map(soldRows.map(r => [Number(r.productId), { totalSold: Number(r.totalSold), totalRevenue: Number(r.totalRevenue) }]));
        }
        catch (e) {
            console.warn('[InventoryService] Could not fetch sold quantities:', e?.message);
        }
        return products
            .map(p => {
            const sold = soldMap.get(p.id) || { totalSold: 0, totalRevenue: 0 };
            const stock = p.stock || 0;
            const stockStatus = stock === 0 ? 'out' : stock <= 5 ? 'low' : 'ok';
            return {
                id: p.id,
                name: p.name,
                barcode: p.barcode || null,
                category: p.category?.name || null,
                supplier: p.supplier || null,
                price: Number(p.price),
                cost: p.cost ? Number(p.cost) : null,
                stock,
                stockCostValue: stock * Number(p.cost || 0),
                stockRetailValue: stock * Number(p.price || 0),
                totalSold: sold.totalSold,
                totalRevenue: sold.totalRevenue,
                stockStatus,
            };
        })
            .sort((a, b) => {
            const order = { out: 0, low: 1, ok: 2 };
            return order[a.stockStatus] - order[b.stockStatus];
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_movement_entity_1.InventoryMovement)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map