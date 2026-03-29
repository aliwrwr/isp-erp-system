"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const subscribers_module_1 = require("./subscribers/subscribers.module");
const packages_module_1 = require("./packages/packages.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const routers_module_1 = require("./routers/routers.module");
const sales_module_1 = require("./sales/sales.module");
const inventory_module_1 = require("./inventory/inventory.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const invoices_module_1 = require("./invoices/invoices.module");
const sales_customers_module_1 = require("./sales-customers/sales-customers.module");
const departments_module_1 = require("./departments/departments.module");
const attendance_module_1 = require("./attendance/attendance.module");
const salaries_module_1 = require("./salaries/salaries.module");
const messaging_module_1 = require("./messaging/messaging.module");
const support_module_1 = require("./support/support.module");
const payments_module_1 = require("./payments/payments.module");
const restaurant_module_1 = require("./restaurant/restaurant.module");
const managers_module_1 = require("./managers/managers.module");
const backup_module_1 = require("./backup/backup.module");
const deploy_module_1 = require("./deploy/deploy.module");
const expenses_module_1 = require("./expenses/expenses.module");
const cashbox_module_1 = require("./cashbox/cashbox.module");
const system_settings_module_1 = require("./system-settings/system-settings.module");
const installments_module_1 = require("./installments/installments.module");
const groups_module_1 = require("./groups/groups.module");
const global_reports_module_1 = require("./global-reports/global-reports.module");
const config_2 = __importDefault(require("./config/config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            global_reports_module_1.GlobalReportsModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.default],
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'isp-erp.sqlite',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            subscribers_module_1.SubscribersModule,
            packages_module_1.PackagesModule,
            subscriptions_module_1.SubscriptionsModule,
            routers_module_1.RoutersModule,
            sales_module_1.SalesModule,
            inventory_module_1.InventoryModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            suppliers_module_1.SuppliersModule,
            invoices_module_1.InvoicesModule,
            sales_customers_module_1.SalesCustomersModule,
            departments_module_1.DepartmentsModule,
            attendance_module_1.AttendanceModule,
            salaries_module_1.SalariesModule,
            messaging_module_1.MessagingModule,
            support_module_1.SupportModule,
            payments_module_1.PaymentsModule,
            restaurant_module_1.RestaurantModule,
            managers_module_1.ManagersModule,
            whatsapp_module_1.WhatsappModule,
            backup_module_1.BackupModule,
            deploy_module_1.DeployModule,
            expenses_module_1.ExpensesModule,
            cashbox_module_1.CashboxModule,
            system_settings_module_1.SystemSettingsModule,
            installments_module_1.InstallmentsModule,
            groups_module_1.GroupsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map