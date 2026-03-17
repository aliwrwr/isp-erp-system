import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { PackagesModule } from './packages/packages.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RoutersModule } from './routers/routers.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SalesCustomersModule } from './sales-customers/sales-customers.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SalariesModule } from './salaries/salaries.module';
import { MessagingModule } from './messaging/messaging.module';
import { SupportModule } from './support/support.module';
import { PaymentsModule } from './payments/payments.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ManagersModule } from './managers/managers.module';
import { BackupModule } from './backup/backup.module';
import { DeployModule } from './deploy/deploy.module';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'isp-erp.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SubscribersModule,
    PackagesModule,
    SubscriptionsModule,
    RoutersModule,
    SalesModule,
    InventoryModule,
    CategoriesModule,
    ProductsModule,
    SuppliersModule,
    InvoicesModule,
    SalesCustomersModule,
    DepartmentsModule,
    AttendanceModule,
    SalariesModule,
    MessagingModule,
    SupportModule,
    PaymentsModule,
    RestaurantModule,
    ManagersModule,
    WhatsappModule,
    BackupModule,
    DeployModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
