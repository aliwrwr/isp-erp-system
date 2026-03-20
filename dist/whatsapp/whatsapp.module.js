"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const whatsapp_settings_entity_1 = require("./entities/whatsapp-settings.entity");
const whatsapp_log_entity_1 = require("./entities/whatsapp-log.entity");
const whatsapp_installments_settings_entity_1 = require("./entities/whatsapp-installments-settings.entity");
const whatsapp_support_settings_entity_1 = require("./entities/whatsapp-support-settings.entity");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_controller_1 = require("./whatsapp.controller");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const subscriber_entity_1 = require("../subscribers/entities/subscriber.entity");
const router_entity_1 = require("../routers/entities/router.entity");
const routers_module_1 = require("../routers/routers.module");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([whatsapp_settings_entity_1.WhatsappSettings, whatsapp_log_entity_1.WhatsappLog, whatsapp_installments_settings_entity_1.WhatsappInstallmentsSettings, whatsapp_support_settings_entity_1.WhatsappSupportSettings, subscription_entity_1.Subscription, subscriber_entity_1.Subscriber, router_entity_1.Router]),
            routers_module_1.RoutersModule,
        ],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [whatsapp_service_1.WhatsappService, notification_scheduler_service_1.NotificationSchedulerService],
        exports: [whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map