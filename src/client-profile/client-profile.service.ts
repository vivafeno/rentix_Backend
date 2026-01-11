import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClientProfile } from './entities/client-profile.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';

@Injectable()
export class ClientProfileService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
  ) {}

  async create(companyId: string, createDto: CreateClientProfileDto) {
    try {
      // 1. Desestructuramos para separar la dirección (singular) del resto de datos
      const { address, fiscalIdentity, ...clientData } = createDto;

      // 2. Generación automática del Código Interno si no viene informado
      if (!clientData.internalCode) {
        clientData.internalCode = await this.generateInternalCode(companyId);
      }

      // 3. Creamos la instancia de la entidad
      // TypeORM manejará la creación de FiscalIdentity y Address gracias al 'cascade: true'
      const clientProfile = this.clientProfileRepository.create({
        ...clientData,
        companyId, // 👈 Inyectamos el ID de la empresa (contexto del usuario)
        
        // Mapeo manual: DTO (address) -> Entity (addresses[])
        addresses: address ? [address] : [], 
        
        // Mapeo directo: DTO (fiscalIdentity) -> Entity (fiscalIdentity)
        fiscalIdentity: fiscalIdentity, 
      });

      // 4. Guardamos (La transacción guarda Cliente + FiscalIdentity + Address)
      return await this.clientProfileRepository.save(clientProfile);

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Genera un código simple incremental o aleatorio si no se provee uno.
   * Ejemplo simple: CLI-{TIMESTAMP}
   */
  private async generateInternalCode(companyId: string): Promise<string> {
    // OPCIÓN A: Código basado en timestamp (Rápido y colisión casi nula en bajo volumen)
    return `CLI-${Date.now().toString().slice(-6)}`;

    // OPCIÓN B (Más pro): Buscar el último y sumar +1 (Requiere consulta extra)
    /*
    const lastClient = await this.clientProfileRepository.findOne({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
    // lógica para incrementar número...
    */
  }

  private handleDBExceptions(error: any) {
    // Capturamos el error del índice único (companyId + internalCode)
    if (error.code === '23505') {
      throw new ConflictException('Ya existe un cliente con ese código interno en esta empresa.');
    }
    
    // Capturamos errores relacionados con NIF duplicado si tuvieras unique constraint en FiscalIdentity
    // if (error.message.includes('fiscal_identity')) ...

    console.error(error);
    throw new InternalServerErrorException('Error al crear la ficha del cliente');
  }
}