import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../user/entities/user.entity';

/**
 * @class SeederModule
 * @description Módulo de hidratación de datos.
 * Rigor 2026: Solo importa las entidades estrictamente necesarias para el SeederService
 * para optimizar el tiempo de compilación y el uso de recursos.
 */
@Module({
  imports: [
    // 🚩 Rigor: Solo inyectamos User ya que es la única entidad que usa el SeederService actual
    TypeOrmModule.forFeature([
      User,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService], // Permite que la AppModule lo use en el arranque
})
export class SeederModule {}