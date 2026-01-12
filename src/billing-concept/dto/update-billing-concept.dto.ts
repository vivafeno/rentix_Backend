import { PartialType } from '@nestjs/swagger';
import { CreateBillingConceptDto } from './create-billing-concept.dto';

export class UpdateBillingConceptDto extends PartialType(CreateBillingConceptDto) {}
