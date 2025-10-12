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

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'text', nullable: true })
    refreshTokenHash: string | null;


    @Column({ nullable: true })
    globalRole?: string;

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

}
