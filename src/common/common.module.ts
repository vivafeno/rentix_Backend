import { Module } from '@nestjs/common';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [PdfModule],
  exports: [PdfModule], // Exportamos PdfModule para que el PdfService sea accesible
})
export class CommonModule {}