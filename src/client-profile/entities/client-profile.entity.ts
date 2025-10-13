import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    BaseEntity
} from 'typeorm';

import { User } from '../../user/entities/user.entity'
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('client-profiles')
export class ClientProfile extends BaseEntity {
 
    @Column()
    name: string;

    @Column()
    nif: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @ManyToOne(() => Company, (company) => company.clientProfiles, { onDelete: 'CASCADE' })
    company: Company;

    @ManyToOne(() => User, (user) => user.clientProfiles, { nullable: true, onDelete: 'CASCADE' })
    user?: User;

    @OneToMany(() => Address, address => address.client, { cascade: true })
    addresses: Address[];

}
