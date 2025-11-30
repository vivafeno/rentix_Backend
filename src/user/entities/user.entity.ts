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
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('users')
export class User extends BaseEntity{

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'text', nullable: true })
    refreshTokenHash: string | null;

    @Column({ nullable: true })
    globalRole?: string;

    @OneToMany(() => UserCompanyRole, (ucr) => ucr.user)
    companyRoles: UserCompanyRole[];

    @OneToMany(() => ClientProfile, (client) => client.user, { nullable: true })
    clientProfiles?: ClientProfile[];

}
