import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { FiscalEntity } from './entities/fiscal.entity';
import { CreateFiscalDto } from './dto/create-fiscal.dto';

/**
 * @class FiscalService
 * @description Gestión de identidades fiscales.
 * Rigor 2026: Sincronización de nomenclatura inglesa y manejo de duplicidad global.
 */
@Injectable()
export class FiscalService { // 🚩 EXPORT asegurado para resolver TS2305
  private readonly logger = new Logger(FiscalService.name);

  constructor(
    @InjectRepository(FiscalEntity)
    private readonly fiscalRepo: Repository<FiscalEntity>,
  ) {}

  /**
   * @method create
   * @description Registra una entidad fiscal validando la unicidad del NIF en el contexto global.
   */
  async create(dto: CreateFiscalDto): Promise<FiscalEntity> {
    // 🛡️ Validación de existencia global (sin empresa asociada)
    const existing = await this.fiscalRepo.findOne({
      where: { nif: dto.nif, companyId: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`Identity with NIF ${dto.nif} already exists globally.`);
    }

    try {
      /**
       * 🚩 Rigor 2026: Mapeo de DTO (español/entrada) a Entidad (inglés/persistencia).
       * Esto resuelve los errores de 'Property nombreRazonSocial does not exist'.
       */
      const newEntityData: DeepPartial<FiscalEntity> = {
        personType: dto.tipoPersona,      // Mapeo: tipoPersona -> personType
        taxIdType: dto.tipoIdFiscal,      // Mapeo: tipoIdFiscal -> taxIdType
        nif: dto.nif,
        fullName: dto.nombreRazonSocial,  // Mapeo: nombreRazonSocial -> fullName
        tradeName: dto.nombreComercial,   // Mapeo: nombreComercial -> tradeName
        residenceType: dto.tipoResidencia, // Mapeo: tipoResidencia -> residenceType
        countryCode: dto.codigoPais.toUpperCase(), // Mapeo: codigoPais -> countryCode
      };

      const entity = this.fiscalRepo.create(newEntityData);
      return await this.fiscalRepo.save(entity);

    } catch (error: unknown) {
      this.handleDBError(error);
    }
  }

  /**
   * @method findByCompany
   * @description Recupera la identidad fiscal de una empresa específica.
   */
  async findByCompany(companyId: string): Promise<FiscalEntity | null> {
    return await this.fiscalRepo.findOne({ where: { companyId } });
  }

  /**
   * @private
   * @method handleDBError
   * @description Centralizador de excepciones para cumplir con TypeScript Strict.
   */
  private handleDBError(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };
    
    if (dbError.code === '23505') {
      throw new ConflictException(`Duplicate NIF violation: ${dbError.detail || ''}`);
    }

    this.logger.error(`[FiscalService] Critical Error: ${dbError.detail || 'Unknown DB error'}`);
    throw new InternalServerErrorException('Infrastructure failure in Fiscal module.');
  }
}