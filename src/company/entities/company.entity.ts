import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { UserCompanyRole } from '../../user-company-role/entities/user-company-role.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => UserCompanyRole, (ucr) => ucr.user)
    companyRoles: UserCompanyRole[];

    @OneToMany(() => ClientProfile, (client) => client.user, { nullable: true })
    clientProfiles?: ClientProfile[];

    @OneToMany(() => Address, address => address.company, { cascade: true })
    addresses: Address[];



}
