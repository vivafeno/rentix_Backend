import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../user/entities/user.entity';
import { AppRole } from '../auth/enums/user-global-role.enum';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('▶ Iniciando seeding (SUPERADMIN ONLY)...');
    try {
      await this.seedSuperAdmin();
      this.logger.log('🚀 Seeding completado con éxito.');
    } catch (e) {
      this.logger.error('Error crítico en seeding:', e);
    }
  }

  private async seedSuperAdmin(): Promise<User> {
    const email = 'admin@rentix.com';

    // 1. Usamos find (devuelve Array)
    const existingUsers = await this.userRepo.find({ where: { email } });

    // 2. Comprobación explícita de longitud y retorno del índice 0
    if (existingUsers.length > 0) {
      this.logger.log(`Superadmin ya existe: ${email}`);
      return existingUsers[0]; // Retorna explícitamente User
    }

    // 3. Creación limpia sin 'as any' si es posible, o mínima
    const newAdminPayload = {
      email,
      password: await bcrypt.hash('Admin123!', 10),
      appRole: AppRole.SUPERADMIN,
      fullName: 'System Admin',
    };

    // create() devuelve un objeto único cuando se le pasa un objeto único
    const newAdmin = this.userRepo.create(newAdminPayload as unknown as User); 
    
    return await this.userRepo.save(newAdmin);
  }
}