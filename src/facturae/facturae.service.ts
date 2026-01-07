import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FacturaeParty } from './entities/facturaeParty.entity';
import { CreateFacturaePartyDto } from './dto/createFacturaeParty.dto';
import { ResidenceType } from './enums/residenceType.enum';

/**
 * FacturaeService
 *
 * Lógica de dominio para identidades fiscales (FacturaeParty)
 *
 * ⚠️ Alcance actual (intencionadamente limitado):
 * - Crear identidades fiscales
 * - Garantizar integridad mínima del modelo
 *
 * NO hace:
 * - Validaciones fiscales avanzadas
 * - Asignación a empresa
 * - Reglas por país o régimen fiscal
 */
@Injectable()
export class FacturaeService {
  constructor(
    @InjectRepository(FacturaeParty)
    private readonly facturaePartyRepository: Repository<FacturaeParty>,
  ) {}

  /**
   * Crear identidad fiscal (FacturaeParty)
   *
   * Uso:
   * - Paso intermedio del wizard de creación de empresa
   *
   * Garantías que aplica:
   * - taxId único (si existe → conflicto)
   * - Campos NOT NULL siempre informados
   * - Defaults coherentes con Facturae España
   */
  async create(
    dto: CreateFacturaePartyDto,
  ): Promise<FacturaeParty> {

    /**
     * 1️⃣ Unicidad básica por taxId
     */
    const existing = await this.facturaePartyRepository.findOne({
      where: { taxId: dto.taxId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una identidad fiscal con este taxId',
      );
    }

    /**
     * 2️⃣ Construcción controlada de la entidad
     *
     * ⚠️ NO confiamos ciegamente en el DTO
     * porque el modelo tiene campos obligatorios
     */
    const entity = this.facturaePartyRepository.create({
      ...dto,

      /**
       * Defaults obligatorios según modelo y Facturae
       */
      residenceType: dto.residenceType ?? ResidenceType.RESIDENT,
      countryCode: dto.countryCode ?? 'ES',
    });

    /**
     * 3️⃣ Persistencia
     */
    return this.facturaePartyRepository.save(entity);
  }
}
