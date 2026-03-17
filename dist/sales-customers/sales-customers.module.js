"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesCustomersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sales_customer_entity_1 = require("./entities/sales-customer.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const sales_customers_service_1 = require("./sales-customers.service");
const sales_customers_controller_1 = require("./sales-customers.controller");
let SalesCustomersModule = class SalesCustomersModule {
};
exports.SalesCustomersModule = SalesCustomersModule;
exports.SalesCustomersModule = SalesCustomersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([sales_customer_entity_1.SalesCustomer, invoice_entity_1.Invoice])],
        controllers: [sales_customers_controller_1.SalesCustomersController],
        providers: [sales_customers_service_1.SalesCustomersService],
    })
], SalesCustomersModule);
//# sourceMappingURL=sales-customers.module.js.map