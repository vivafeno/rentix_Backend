import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address } from './entities/address.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';

/**
 * AddressModule
 *
 * Módulo encargado de la gestión integral de direcciones postales.
 *
 * Funcionalidades:
 * - Creación de borradores (Drafts) durante el registro.
 * - Gestión de direcciones activas vinculadas a empresas.
 * - Validación de permisos de acceso mediante roles.
 */
@Module({
  imports: [
    /**
     * TypeOrmModule.forFeature:
     * Registra los repositorios que se inyectarán en el AddressService.
     * * - Address: Entidad principal del módulo.
     * - CompanyRoleEntity: Necesaria para verificar si el usuario tiene permisos
     * (Owner/Admin) sobre la empresa antes de modificar sus direcciones.
     */
    TypeOrmModule.forFeature([
      Address,
      CompanyRoleEntity,
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule { }