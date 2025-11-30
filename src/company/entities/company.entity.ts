import {
  Entity,
  Column,
  OneToMany,
  BaseEntity
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserCompanyRole } from '../../user-company-role/entities/user-company-role.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @ApiProperty({
    example: 'Industria Soluciones SL',
    description: 'Nombre de la empresa o razón social'
  })
  @Column()
  name: string;

  @ApiProperty({
    type: [UserCompanyRole],
    description: 'Lista de roles de usuarios asignados a la empresa'
  })
  @OneToMany(() => UserCompanyRole, (ucr) => ucr.user)
  companyRoles: UserCompanyRole[];

  @ApiProperty({
    type: [ClientProfile],
    description: 'Perfiles de cliente registrados para esta empresa',
    required: false
  })
  @OneToMany(() => ClientProfile, (client) => client.user, { nullable: true })
  clientProfiles?: ClientProfile[];

  @ApiProperty({
    type: [Address],
    description: 'Direcciones asociadas a la empresa'
  })
  @OneToMany(() => Address, address => address.company, { cascade: true })
  addresses: Address[];
}
