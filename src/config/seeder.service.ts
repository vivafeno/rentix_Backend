import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../user/entities/user.entity';
import { AppRole } from '../auth/enums/user-global-role.enum';

/**
 * @class SeederService
 * @description Motor de hidratación de datos maestros Rentix 2026.
 * Implementa el protocolo de "Nodo Raíz" para asegurar el acceso inicial al sistema.
 */
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) 
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * @method seed
   * @description Orquestador de seeding. Ejecuta tareas en secuencia lógica.
   */
  async seed(): Promise<void> {
    this.logger.log('🚀 [Rentix 2026] Iniciando protocolo de Seeding...');
    
    try {
      const admin = await this.seedSuperAdmin();
      this.logger.log(`✅ [Identity] Nodo Raíz verificado: ${admin.email}`);
      this.logger.log('🏁 [Rentix 2026] Seeding completado con éxito.');
    } catch (error) {
      this.logger.error('❌ [Critical] Fallo en la hidratación de datos:', error);
      throw error; 
    }
  }

  /**
   * @method seedSuperAdmin
   * @description Garantiza la existencia del SUPERADMIN.
   * Resuelve TS2740 mediante tipado explícito de instancia.
   */
private async seedSuperAdmin(): Promise<User> {
    const email = 'admin@rentix.com';

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) return existingUser;

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // 🚩 Rigor 2026: Reset de inferencia mediante 'unknown'
    // 1. Creamos el objeto
    // 2. Lo convertimos a unknown para romper el enlace con User[]
    // 3. Lo convertimos a User para que el save() sea feliz
    const superAdmin = this.userRepo.create({
      email,
      password: hashedPassword,
      appRole: AppRole.SUPERADMIN,
      firstName: 'System',
      lastName: 'Admin',
      acceptTerms: true,
      isActive: true,
      isEmailVerified: true,
    } as any) as unknown as User; 

    // Ahora TS reconoce que save() recibe un User y devuelve un User
    return await this.userRepo.save(superAdmin);
  }
}