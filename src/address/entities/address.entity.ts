import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { AddressType } from '../enums/addres-type.enum';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

@Entity()
export class Address extends BaseEntity {

    @Column()
    street: string;

    @Column()
    city: string;

    @Column()
    province: string;

    @Column()
    postalCode: string;

    @Column()
    country: string;

    @Column({
        type: 'enum',
        enum: AddressType,
        default: AddressType.Fiscal,
    })
    type: AddressType;

    // src/address/entities/address.entity.ts
    @ManyToOne(() => Company, company => company.addresses, { nullable: true })
    company: Company;

    // src/address/entities/address.entity.ts
    @ManyToOne(() => ClientProfile, client => client.addresses, { nullable: true })
    client: ClientProfile;



}
