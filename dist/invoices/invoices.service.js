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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
const invoice_item_entity_1 = require("./entities/invoice-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
const sales_customer_entity_1 = require("../sales-customers/entities/sales-customer.entity");
const DIRECT_SALE = 'مبيعات مباشر';
let InvoicesService = class InvoicesService {
    invoicesRepository;
    invoiceItemsRepository;
    productsRepository;
    customersRepository;
    constructor(invoicesRepository, invoiceItemsRepository, productsRepository, customersRepository) {
        this.invoicesRepository = invoicesRepository;
        this.invoiceItemsRepository = invoiceItemsRepository;
        this.productsRepository = productsRepository;
        this.customersRepository = customersRepository;
    }
    async create(createInvoiceDto) {
        const items = await Promise.all(createInvoiceDto.items.map(async (itemDto) => {
            const item = new invoice_item_entity_1.InvoiceItem();
            if (itemDto.productId) {
                const product = await this.productsRepository.findOneBy({ id: itemDto.productId });
                if (product) {
                    item.product = product;
                    item.name = product.name;
                    product.stock -= itemDto.quantity;
                    await this.productsRepository.save(product);
                }
            }
            if (itemDto.name)
                item.name = itemDto.name;
            item.quantity = itemDto.quantity;
            item.price = itemDto.price;
            return item;
        }));
        const { items: _, ...rest } = createInvoiceDto;
        const invoice = this.invoicesRepository.create({
            ...rest,
            invoiceNumber: `INV-${Date.now()}`,
            items,
            paymentStatus: createInvoiceDto.paymentStatus || 'paid',
            paidAmount: createInvoiceDto.paidAmount ?? createInvoiceDto.total,
        });
        const saved = await this.invoicesRepository.save(invoice);
        const name = createInvoiceDto.customerName;
        if (name && name !== DIRECT_SALE) {
            const phone = createInvoiceDto.customerPhone || null;
            const existing = phone
                ? await this.customersRepository.findOne({ where: { phone } })
                : await this.customersRepository.findOne({ where: { name } });
            if (!existing) {
                await this.customersRepository.save(this.customersRepository.create({
                    name,
                    phone: phone || undefined,
                    address: createInvoiceDto.customerAddress || undefined,
                }));
            }
        }
        return Array.isArray(saved) ? saved[0] : saved;
    }
    findAll() {
        return this.invoicesRepository.find({ relations: ['customer', 'items', 'items.product'] });
    }
    findOne(id) {
        return this.invoicesRepository.findOne({ where: { id }, relations: ['customer', 'items', 'items.product'] });
    }
    async update(id, updateInvoiceDto) {
        await this.invoicesRepository.update(id, updateInvoiceDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.invoicesRepository.delete(id);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(sales_customer_entity_1.SalesCustomer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map