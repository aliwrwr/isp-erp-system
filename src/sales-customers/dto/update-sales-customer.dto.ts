import { PartialType } from '@nestjs/swagger';
import { CreateSalesCustomerDto } from './create-sales-customer.dto';

export class UpdateSalesCustomerDto extends PartialType(CreateSalesCustomerDto) {}
