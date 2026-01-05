import { PartialType } from '@nestjs/swagger';
import { CreateWithholdingRateDto } from './create-withholding-rate.dto';

export class UpdateWithholdingRateDto extends PartialType(
  CreateWithholdingRateDto,
) {}
