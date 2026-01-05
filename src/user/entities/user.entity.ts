import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { CompanyRole } from 'src/user-company-role/enums/company-role.enum';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { BaseEntity } from 'src/common/base/base.entity';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';


@Entity('users')
export class User extends BaseEntity {

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'text', nullable: true })
    refreshTokenHash: string | null;

    @Column({
        type: 'enum',
        enum: UserGlobalRole,
        default: UserGlobalRole.USER,
    })
    userGlobalRole: UserGlobalRole;

    @OneToMany(() => UserCompanyRole, (ucr) => ucr.user)
    companyRoles: UserCompanyRole[];

    @OneToMany(() => ClientProfile, (client) => client.user, { nullable: true })
    clientProfiles?: ClientProfile[];
}
