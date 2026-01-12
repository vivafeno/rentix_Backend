import { Column, Entity, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity'; // Ajusta la ruta si es necesario
import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdTtype.enum'; // Ojo al typo en tu nombre de archivo original (Ttype)
import { ResidenceType } from '../enums/residenceType.enum';

@Entity('fiscal_identities')
@Index('IDX_FISCAL_IDENTITY_GLOBAL_COMPANY', ['taxId'], { 
  unique: true, 
  where: 'company_id IS NULL' 
})
@Index('IDX_FISCAL_IDENTITY_PER_TENANT', ['taxId', 'companyId'], { 
  unique: true, 
  where: 'company_id IS NOT NULL' 
})
export class FiscalIdentity extends BaseEntity {
  
  // 👇👇 ESTO ES LO QUE NECESITA EL SERVICIO PARA NO DAR ERROR 👇👇
  @ApiPropertyOptional({ description: 'ID de la empresa propietaria (si es un cliente)' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string; 
  // 👆👆 --------------------------------------------------- 👆👆

  @ApiProperty({
    description: 'Tipo de persona: F (Física/Autónomo) o J (Jurídica/Empresa)',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @Column({
    name: 'person_type',
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
  })
  personType: PersonType;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TaxIdType,
    example: TaxIdType.NIF,
  })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  taxIdType: TaxIdType;

  @ApiProperty({ example: 'B12345678' })
  @Column({ name: 'tax_id', length: 20 })
  taxId: string;

  @ApiPropertyOptional({ example: 'Rentix Solutions S.L.' })
  @Column({ name: 'corporate_name', nullable: true })
  corporateName?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez García' })
  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Rentix App' })
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  @ApiProperty({
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  @Column({
    name: 'residence_type',
    type: 'enum',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  residenceType: ResidenceType;

  @ApiProperty({ example: 'ESP', default: 'ESP' })
  @Column({ name: 'country_code', length: 3, default: 'ESP' })
  countryCode: string;

  @OneToOne(() => Company, (company) => company.facturaeParty)
  company: Company;
}