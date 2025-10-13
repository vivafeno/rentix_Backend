import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { AddressType } from '../enums/addres-type.enum';

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
}
