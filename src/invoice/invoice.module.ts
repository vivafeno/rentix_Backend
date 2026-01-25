import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { InvoiceCronService } from './invoice-cron.service';
import { CommonModule } from 'src/common/common.module';

/**
 * @description Módulo de Facturación de Rentix 2026.
 * Encapsula la lógica de emisión de facturas, gestión de líneas y control de secuencias legales.
 * Registra los repositorios necesarios para el cumplimiento de Veri*factu.
 */
@Module({
  imports: [
    // Registro de las entidades en TypeORM para habilitar la inyección de repositorios
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      InvoiceSequence
    ]),
    CommonModule
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceCronService,
  ],
  exports: [
    InvoiceService, // Exportamos el servicio por si otros módulos (ej. Contracts) necesitan generar facturas
    TypeOrmModule,   // Exportamos TypeORM para facilitar tests o integraciones
  ],
})
export class InvoiceModule { }