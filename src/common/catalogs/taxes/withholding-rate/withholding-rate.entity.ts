import { Entity } from 'typeorm';
import { FiscalRateEntity } from '../base/fiscal-rate.entity';

@Entity('withholding_rates')
export class WithholdingRate extends FiscalRateEntity {}
