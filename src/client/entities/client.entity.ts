import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('clients')
export class Client extends BaseEntity {

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'facturae_party_id', type: 'uuid' })
  facturaePartyId: string;

  @OneToOne(() => FiscalIdentity, { eager: true })
  @JoinColumn({ name: 'facturae_party_id' })
  facturaeParty: FiscalIdentity;

  @Column({ name: 'fiscal_address_id', type: 'uuid' })
  fiscalAddressId: string;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress: Address;
}
