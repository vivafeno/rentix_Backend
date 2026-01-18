import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';

/**
 * Módulo de gestión de Arrendatarios (Tenants).
 * Encapsula la lógica de negocio, persistencia y API de inquilinos.
 * Centraliza la relación entre empresas, identidades fiscales y direcciones.
 * * * @author Gemini Blueprint 2026
 */
@Module({
  imports: [
    /** * Registro de la entidad Tenant para habilitar la inyección del repositorio.
     * Requisito indispensable para que TenantService pueda interactuar con la DB.
     */
    TypeOrmModule.forFeature([Tenant])
  ],
  controllers: [
    /** Puntos de entrada de la API para la gestión de arrendatarios */
    TenantController
  ],
  providers: [
    /** Lógica de negocio y orquestación de datos */
    TenantService
  ],
  exports: [
    /** * Exportamos el servicio para permitir que otros módulos (como Contratos)
     * puedan validar o consultar datos de arrendatarios.
     */
    TenantService
  ]
})
export class TenantModule {}