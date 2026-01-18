import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { FiscalEntity } from './entities/fiscalEntity';
import { CreateFiscalDto } from './dto/create-fiscal.dto';

@Injectable()
export class FiscalService {
  constructor(
    @InjectRepository(FiscalEntity)
    private readonly fiscalRepo: Repository<FiscalEntity>,
  ) {}

  async create(dto: CreateFiscalDto): Promise<FiscalEntity> {
    const existing = await this.fiscalRepo.findOne({
      where: { nif: dto.nif, companyId: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`NIF ${dto.nif} ya existe globalmente.`);
    }

    try {
      // 🛡️ Mapeo seguro con los campos reales de la entidad
      const newEntityData: DeepPartial<FiscalEntity> = {
        tipoPersona: dto.tipoPersona,
        tipoIdFiscal: dto.tipoIdFiscal,
        nif: dto.nif,
        nombreRazonSocial: dto.nombreRazonSocial,
        nombreComercial: dto.nombreComercial,
        tipoResidencia: dto.tipoResidencia,
        codigoPais: dto.codigoPais.toUpperCase(),
      };

      const entity = this.fiscalRepo.create(newEntityData);
      return await this.fiscalRepo.save(entity);
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError.code === '23505')
        throw new ConflictException('NIF duplicado.');
      throw new InternalServerErrorException('Error al crear entidad fiscal.');
    }
  }
}
