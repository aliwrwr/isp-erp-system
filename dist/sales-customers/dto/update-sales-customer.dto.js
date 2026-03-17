"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSalesCustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_sales_customer_dto_1 = require("./create-sales-customer.dto");
class UpdateSalesCustomerDto extends (0, swagger_1.PartialType)(create_sales_customer_dto_1.CreateSalesCustomerDto) {
}
exports.UpdateSalesCustomerDto = UpdateSalesCustomerDto;
//# sourceMappingURL=update-sales-customer.dto.js.map