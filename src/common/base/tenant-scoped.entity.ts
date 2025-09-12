import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TenantScopedEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;
}
