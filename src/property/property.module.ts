import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

// Entidades CORE para la gestión de activos
import { Property } from './entities/property.entity';
import { Address } from 'src/address/entities/address.entity';
import { Company } from 'src/company/entities/company.entity';

/**
 * @class PropertyModule
 * @description Módulo de gestión de activos inmobiliarios.
 * Orquesta la persistencia atómica de inmuebles y sus localizaciones.
 * @version 2026.01.22
 * @author Rentix 2026
 */
@Module({
  imports: [
    /** * 📦 Registro de Entidades: 
     * Se incluyen Address y Company para permitir las transacciones 
     * y el 'cascade save' durante el alta de propiedades.
     */
    TypeOrmModule.forFeature([
      Property, 
      Address, 
      Company
    ]),
  ],
  controllers: [
    /** 📡 Endpoints de gestión de inventario */
    PropertyController
  ],
  providers: [
    /** ⚙️ Lógica de negocio y aislamiento de Tenant */
    PropertyService
  ],
  exports: [
    /** * 📤 Exportamos el Service para que módulos como 'Contract' 
     * puedan validar la existencia y estado de un inmueble.
     */
    PropertyService,
    // Exportamos el TypeOrmModule para compartir los repositorios si es necesario
    TypeOrmModule 
  ],
})
export class PropertyModule {}