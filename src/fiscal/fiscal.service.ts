import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FiscalEntity } from './entities/fiscalEntity';
import { CreateFiscalEntityDto } from './dto/create-fiscal.dto';
import { PersonType } from './enums/personType.enum';

@Injectable()
export class FiscalIdentityService {
  constructor(
    @InjectRepository(FiscalEntity)
    private readonly fiscalIdentityRepo: Repository<FiscalEntity>,
  ) {}

  async create(dto: CreateFiscalEntityDto): Promise<FiscalEntity> {
    // 1. Validar unicidad GLOBAL (Solo contra otras empresas)
    const existing = await this.fiscalIdentityRepo.findOne({
      where: { 
        taxId: dto.taxId,
        companyId: IsNull() 
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una EMPRESA registrada en la plataforma con el NIF/CIF ${dto.taxId}`,
      );
    }

    // CORRECCIÓN: Llamada al método que ahora sí existe
    const cleanDto = this.sanitizePayload(dto);

    try {
      const entity = this.fiscalIdentityRepo.create({
        ...cleanDto,
        countryCode: cleanDto.countryCode?.toUpperCase() || 'ESP',
      });

      // CORRECCIÓN: .save() devuelve la entidad única, resolviendo el error de tipos
      return await this.fiscalIdentityRepo.save(entity);
    } catch (error) {
      if (error.code === '23505') {
         throw new ConflictException('Esta identidad fiscal ya existe.');
      }
      throw new InternalServerErrorException('Error al guardar la identidad fiscal');
    }
  }

  async findOne(id: string): Promise<FiscalEntity> {
    const identity = await this.fiscalIdentityRepo.findOneBy({ id });
    if (!identity) {
      throw new NotFoundException(`Identidad fiscal con ID ${id} no encontrada`);
    }
    return identity;
  }

  private sanitizePayload(dto: CreateFiscalEntityDto): CreateFiscalEntityDto {
    const sanitized = { ...dto };
    if (sanitized.personType === PersonType.LEGAL_ENTITY) {
      delete sanitized.legalName;
      delete sanitized.legalSurname;
    } else {
      delete sanitized.corporateName;
    }
    return sanitized;
  }
}