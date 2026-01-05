import { Entity } from 'typeorm';
import { FiscalRateEntity } from '../base/fiscal-rate.entity';

@Entity('vat_rates')
export class VatRate extends FiscalRateEntity {}
