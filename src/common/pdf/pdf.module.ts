import { Module, Global } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Global() // Lo hacemos global para que cualquier módulo pueda imprimir PDFs
@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}