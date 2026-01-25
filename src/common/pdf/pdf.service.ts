import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateInvoicePdf(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Aquí definimos el diseño profesional con CSS3
      const htmlContent = this.getTemplate(data);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error en generación PDF: ${error.message}`);
      if (browser) await browser.close();
      throw error;
    }
  }

  private getTemplate(data: any): string {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #1a56db; }
        .invoice-info { text-align: right; }
        .section-title { font-size: 12px; text-transform: uppercase; color: #777; margin-bottom: 5px; }
        .client-box, .company-box { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f9fafb; text-align: left; padding: 12px; border-bottom: 2px solid #eee; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .totals { margin-top: 30px; margin-left: auto; width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #1a56db; padding-top: 10px; margin-top: 10px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">RENTIX 2026</div>
        <div class="invoice-info">
          <div class="section-title">Factura</div>
          <div style="font-size: 16px; font-weight: bold;">{{invoiceNumber}}</div>
          <div>Fecha: {{issueDate}}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between;">
        <div class="company-box">
          <div class="section-title">Emisor</div>
          <strong>{{companyName}}</strong><br>
          NIF: {{companyTaxId}}<br>
          {{companyAddress}}
        </div>
        <div class="client-box">
          <div class="section-title">Receptor</div>
          <strong>{{clientName}}</strong><br>
          NIF: {{clientTaxId}}<br>
          {{clientAddress}}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="text-align: right;">Base</th>
            <th style="text-align: right;">IVA</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{description}}</td>
            <td style="text-align: right;">{{taxableAmount}}€</td>
            <td style="text-align: right;">{{taxPercentage}}%</td>
            <td style="text-align: right;">{{totalLine}}€</td>
          </tr>
          {{/each}}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Base Imponible:</span>
          <span>{{totalTaxableAmount}}€</span>
        </div>
        <div class="total-row">
          <span>IVA:</span>
          <span>{{totalTaxAmount}}€</span>
        </div>
        {{#if totalRetentionAmount}}
        <div class="total-row" style="color: #d11;">
          <span>IRPF (Retención):</span>
          <span>-{{totalRetentionAmount}}€</span>
        </div>
        {{/if}}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>{{totalAmount}}€</span>
        </div>
      </div>

      <div class="footer">
        Generado automáticamente por Rentix 2026 Patrimonial - Documento con validez fiscal.
      </div>
    </body>
    </html>
    `;
    return handlebars.compile(html)(data);
  }
}