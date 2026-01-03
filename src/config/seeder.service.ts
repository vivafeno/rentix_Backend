// src/config/seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserGlobalRole, User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { RoleType, UserCompanyRole } from '../user-company-role/entities/user-company-role.entity';

@Injectable()
export class SeederService {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Company) private companyRepo: Repository<Company>,
        @InjectRepository(UserCompanyRole)
        private userCompanyRoleRepo: Repository<UserCompanyRole>,
    ) { }

    async seed() {
        // 1. Usuario superadmin
        let user = await this.userRepo.findOne({ where: { email: 'admin@rentix.com' } });
        if (!user) {
            const hash = await bcrypt.hash('Admin123!', 10);
            user = this.userRepo.create({
                email: 'admin@rentix.com',
                password: hash,
                userGlobalRole: UserGlobalRole.SUPERADMIN,
            });
            await this.userRepo.save(user);
            this.logger.log('Usuario superadmin creado');
        }

        // 2. Empresa demo
        let company = await this.companyRepo.findOne({ where: { name: 'Empresa Demo' } });
        if (!company) {
            company = this.companyRepo.create({ name: 'Empresa Demo' });
            await this.companyRepo.save(company);
            this.logger.log('Empresa demo creada');
        }

        // 3. Relación usuario ↔ empresa
        const existingRole = await this.userCompanyRoleRepo.findOne({
            where: { user: { id: user.id }, company: { id: company.id } },
        });

        if (!existingRole) {
            const role = this.userCompanyRoleRepo.create({
                user: { id: user.id },
                company: { id: company.id },
                role: RoleType.OWNER,
            });
            await this.userCompanyRoleRepo.save(role);
            this.logger.log('Relación usuario-owner con empresa demo creada');
        }
    }
}
