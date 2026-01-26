import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import { join } from 'path';
import { v4 as uuid } from 'uuid';


/**
 * @module StorageModule
 * @description Motor de persistencia de archivos de Rentix 2026.
 * Implementa un sistema de almacenamiento jerárquico por Empresa (Tenant)
 * para asegurar el aislamiento de datos y facilitar auditorías.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly rootPath = join(process.cwd(), 'uploads');

  constructor() {
    // Asegurar la existencia del directorio raíz al instanciar el servicio
    fs.ensureDirSync(this.rootPath);
  }

  /**
   * @method saveFile
   * @description Guarda un archivo físico en el sistema de archivos.
   * @param {Multer.File} file - Objeto del archivo recibido vía interceptor.
   * @param {string} companyId - Identificador de la empresa (aislamiento tenant).
   * @param {string} folder - Subcarpeta lógica (ej: 'properties', 'avatars').
   * @returns {Promise<string>} URL relativa de acceso al recurso.
   */
  async saveFile(
    file: Express.Multer.File, 
    companyId: string, 
    folder: string = 'general'
  ): Promise<string> {
    try {
      // 1. Generación de Nombre Único (Rigor Rentix: Evitar colisiones y rastreo de nombres originales)
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuid()}.${fileExt}`;
      
      // 2. Construcción de Ruta Jerárquica (Tenant Isolation)
      // Estructura: /uploads/{companyId}/{folder}/{uuid.ext}
      const relativePath = join(companyId, folder, fileName);
      const fullPath = join(this.rootPath, relativePath);

      // 3. Persistencia con garantía de directorio
      await fs.ensureDir(join(this.rootPath, companyId, folder));
      await fs.writeFile(fullPath, file.buffer);

      this.logger.log(`[Rentix-Storage] Archivo guardado con éxito: ${relativePath}`);
      
      // Retornamos URL con slashes normalizados para estándares web
      return `/uploads/${relativePath.replace(/\\/g, '/')}`;
    } catch (error: any) {
      this.logger.error(`[CRITICAL-STORAGE] Fallo en escritura: ${error.message}`);
      throw new InternalServerErrorException('Error crítico en el motor de almacenamiento');
    }
  }

  /**
   * @method deleteFile
   * @description Elimina un archivo físico del sistema.
   * @param {string} relativePath - Ruta obtenida previamente del servicio.
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      // Normalización de ruta para evitar errores en Windows/Linux
      const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      const fullPath = join(process.cwd(), cleanPath);
      
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
        this.logger.log(`[Rentix-Storage] Recurso eliminado: ${cleanPath}`);
      }
    } catch (error: any) {
      this.logger.warn(`[STORAGE-WARN] No se pudo borrar el archivo: ${error.message}`);
    }
  }
}