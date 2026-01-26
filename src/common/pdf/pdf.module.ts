import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';

/**
 * @class PdfModule
 * @description Módulo global de generación de documentos.
 * El uso de @Global() permite que Invoice, Contract y Receipt accedan al Singleton de Puppeteer.
 */
@Global()
@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}