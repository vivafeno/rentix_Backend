import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { InvoiceCronService } from './invoice-cron.service';
import { CommonModule } from '../common/common.module'; // 🚩 Ajustado a ruta relativa si es necesario
import { InvoiceSequenceService } from './invoice.sequence.service';

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
      InvoiceSequence,
    ]),
    CommonModule,
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceCronService,
    InvoiceSequenceService,
  ],
  exports: [
    InvoiceService,         // Fundamental para que el módulo de contratos genere facturas
    InvoiceSequenceService, // Útil para otros documentos legales que requieran series
    TypeOrmModule,          // Exportamos para que otros módulos accedan a los repositorios si es necesario
    InvoiceCronService,
  ],
})
export class InvoiceModule {}