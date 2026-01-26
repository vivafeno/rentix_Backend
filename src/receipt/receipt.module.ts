import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { Receipt } from './entities/receipt.entity';
import { PdfModule } from '../common/pdf/pdf.module';

@Module({
  imports: [
    // 1. Registramos la entidad para que el Repository sea inyectable
    TypeOrmModule.forFeature([Receipt]),
    
    // 2. Importamos el módulo de PDF para que ReceiptService pueda usar PdfService
    PdfModule,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  // Exportamos el servicio por si otros módulos (como Invoices) necesitan generar recibos
  exports: [ReceiptService], 
})
export class ReceiptModule {}