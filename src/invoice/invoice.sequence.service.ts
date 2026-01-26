import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { InvoiceSequence } from './entities/invoice-sequence.entity';

/**
 * @class InvoiceSequenceService
 * @description Gestor de numeración legal Rentix 2026.
 * Garantiza la correlatividad exigida por Veri*factu mediante bloqueos pesimistas.
 */
@Injectable()
export class InvoiceSequenceService {
  private readonly logger = new Logger(InvoiceSequenceService.name);

  constructor(
    @InjectRepository(InvoiceSequence)
    private readonly sequenceRepo: Repository<InvoiceSequence>,
  ) {}

  /**
   * @method getNextLegalNumber
   * @description Genera el siguiente número de factura de forma atómica.
   */
  async getNextLegalNumber(
    manager: EntityManager, 
    companyId: string, 
    prefix: string = ''
  ): Promise<string> {
    const year = new Date().getFullYear();

    try {
      // 1. Bloqueo Pesimista (FOR UPDATE)
      let sequence = await manager.findOne(InvoiceSequence, {
        where: { companyId, year, prefix },
        lock: { mode: 'pessimistic_write' },
      });

      // 2. Inicialización si es la primera del año/serie
      if (!sequence) {
        sequence = manager.create(InvoiceSequence, {
          companyId,
          year,
          prefix,
          lastNumber: 0,
        });
        await manager.save(sequence);
        
        // Re-obtener para asegurar consistencia tras el insert
        sequence = await manager.findOneByOrFail(InvoiceSequence, { 
          companyId, year, prefix 
        });
      }

      // 3. Incremento
      sequence.lastNumber += 1;
      await manager.save(sequence);

      // 4. Formateo (Año/Serie-Número)
      const paddedNumber = sequence.lastNumber.toString().padStart(6, '0');
      const series = prefix ? `${prefix}-` : '';
      
      return `${year}/${series}${paddedNumber}`;

    } catch (error: unknown) {
      // 🚩 RIGOR: Type Guard para manejar 'unknown' en TypeScript
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      this.logger.error(`Fallo en secuencia legal [${companyId}]: ${errorMessage}`);
      throw new InternalServerErrorException('Error al generar la numeración oficial.');
    }
  }
}