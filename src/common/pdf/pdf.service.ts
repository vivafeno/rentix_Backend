import { 
  Injectable, 
  Logger, 
  InternalServerErrorException, 
  OnModuleInit, 
  OnModuleDestroy 
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs-extra';
import { join } from 'path';

/**
 * @class PdfService
 * @description Motor de PDF con arquitectura Singleton (Browser) y Contextos (Incognito).
 * Optimizado para alta concurrencia y Signals en Angular 21.
 * @version 2026.4.0
 */
@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: puppeteer.Browser | null = null;

  /**
   * @lifecycle onModuleInit
   * @description Arranca el navegador una sola vez al iniciar el backend.
   */
  async onModuleInit() {
    await this.initBrowser();
  }

  private async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Rigor: Evita colapsos en contenedores
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      });
      this.logger.log('🌐 Motor Puppeteer Singleton: ONLINE');
    } catch (error) {
      this.logger.error('❌ Error crítico iniciando Puppeteer:', error);
    }
  }

  /**
   * @method generateFromTemplate
   * @description Usa la instancia Singleton para crear un contexto aislado.
   */
  async generateFromTemplate(templateName: string, data: any): Promise<Buffer> {
    // 🛡️ Monitor de Salud: Si el navegador se cerró por error, lo reabrimos
    if (!this.browser || !this.browser.connected) {
      this.logger.warn('Navegador desconectado. Reiniciando instancia...');
      await this.initBrowser();
    }

    // 🚩 RIGOR: Creamos un BrowserContext (Incógnito). 
    // Esto es mucho más ligero que abrir un nuevo navegador.
    const context = await this.browser!.createBrowserContext();
    const page = await context.newPage();

    try {
      const htmlContent = await this.compileTemplate(templateName, data);

      // Seteamos el contenido en la pestaña del contexto aislado
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      this.logger.error(`Error en PDF [${templateName}]: ${error.message}`);
      throw new InternalServerErrorException('Error al procesar el documento PDF');
    } finally {
      // 🚩 RIGOR: Cerramos solo el contexto (pestaña y memoria temporal), NO el navegador
      await context.close();
    }
  }

  /**
   * @method compileTemplate
   * @description Alineado con process.cwd() para soportar build dist/
   */
  private async compileTemplate(templateName: string, data: any): Promise<string> {
    // Intentamos buscar en src y en dist para evitar errores de despliegue
    const paths = [
      join(process.cwd(), 'src/common/pdf/templates', `${templateName.toLowerCase()}.html`),
      join(process.cwd(), 'dist/common/pdf/templates', `${templateName.toLowerCase()}.html`)
    ];

    let filePath = '';
    for (const p of paths) {
      if (await fs.pathExists(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      this.logger.error(`Plantilla no encontrada en rutas: ${paths.join(' | ')}`);
      throw new InternalServerErrorException(`Error de configuración de plantillas`);
    }

    const html = await fs.readFile(filePath, 'utf-8');
    return handlebars.compile(html)(data);
  }

  /**
   * @lifecycle onModuleDestroy
   * @description Cierre limpio al apagar el servidor.
   */
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('🌐 Motor Puppeteer Singleton: OFFLINE');
    }
  }
}