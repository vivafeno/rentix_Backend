import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException, // 👈 Importante para el error 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FiscalIdentity } from './entities/fiscalIdentity.entity';
import { CreateFiscalIdentityDto } from './dto/create-fiscalIdentity.dto'
import { PersonType } from './enums/personType.enum';

@Injectable()
export class FiscalIdentityService {
  constructor(
    @InjectRepository(FiscalIdentity)
    private readonly fiscalIdentityRepo: Repository<FiscalIdentity>,
  ) {}

  /**
   * Crea una nueva identidad fiscal.
   */
  async create(dto: CreateFiscalIdentityDto): Promise<FiscalIdentity> {
    // 1. Unicidad del NIF/CIF
    const existing = await this.fiscalIdentityRepo.findOne({
      where: { taxId: dto.taxId },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una identidad fiscal registrada con el NIF/CIF ${dto.taxId}`,
      );
    }

    // 2. Sanitización del Payload
    const cleanDto = this.sanitizePayload(dto);

    // 3. Creación
    try {
      const entity = this.fiscalIdentityRepo.create({
        ...cleanDto,
        // Forzamos mayúsculas para cumplir ISO Alpha-3
        countryCode: cleanDto.countryCode?.toUpperCase() || 'ESP',
      });

      return await this.fiscalIdentityRepo.save(entity);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al guardar la identidad fiscal',
      );
    }
  }

  /**
   * Encuentra una identidad por su ID.
   * Lanza 404 si no existe.
   */
  async findOne(id: string): Promise<FiscalIdentity> {
    const identity = await this.fiscalIdentityRepo.findOneBy({ id });

    // 👇 AQUÍ ESTÁ LA CORRECCIÓN DEL ERROR
    if (!identity) {
      throw new NotFoundException(`Identidad fiscal con ID ${id} no encontrada`);
    }

    return identity;
  }

  /**
   * HELPER: Limpia los campos inconsistentes
   */
  private sanitizePayload(dto: CreateFiscalIdentityDto): CreateFiscalIdentityDto {
    const sanitized = { ...dto };

    if (sanitized.personType === PersonType.LEGAL_ENTITY) {
      // Si es empresa, borramos Nombre y Apellidos
      delete sanitized.firstName;
      delete sanitized.lastName;
    } else {
      // Si es autónomo (INDIVIDUAL), borramos Razón Social
      delete sanitized.corporateName;
    }

    return sanitized;
  }
}