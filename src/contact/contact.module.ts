import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './entities/contact.entity';

/**
 * @module ContactModule
 * @description Módulo encargado de la gestión de la agenda de contactos global.
 * Centraliza la lógica para contactos de empresas y arrendatarios.
 */
@Module({
  imports: [
    // Registro de la entidad para inyección del Repository en el Service
    TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [
    // Endpoints documentados en Swagger
    ContactController
  ],
  providers: [
    // Lógica de negocio con protocolo Soft Delete manual
    ContactService
  ],
  exports: [
    // Exportamos el servicio por si otros módulos (ej. Billing) 
    // necesitan consultar datos de contacto.
    ContactService
  ],
})
export class ContactModule {}