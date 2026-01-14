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

    // 1. Buscamos explícitamente el array
    const existingUsers = await this.userRepo.find({ where: { email } });

    // 2. Comprobamos si tiene elementos y devolvemos el primero (índice 0)
    if (existingUsers.length > 0) {
      this.logger.log(`Superadmin (${email}) ya existe. Omitiendo creación.`);
      return existingUsers[0]; // Retorna explícitamente 'User', no 'User[]'
    }

    // 3. Si no existe, creamos uno nuevo
    const newAdmin = this.userRepo.create({
      email,
      password: await bcrypt.hash('Admin123!', 10),
      roles: [AppRole.SUPERADMIN],
      fullName: 'System Admin',
    } as any);

    return await this.userRepo.save(newAdmin);
  }
}