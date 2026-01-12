import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
// CORRECCIÓN: Importamos el Enum que faltaba
import { AddressStatus } from 'src/address/enums/addressStatus.enum';

@Injectable()
export class ClientProfileService {
  constructor(
    // CORRECCIÓN: Aseguramos 'private readonly' para que sea accesible en 'this'
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    private readonly dataSource: DataSource,
  ) {}

  /* ------------------------------------------------------------------
   * CREATE
   * ------------------------------------------------------------------ */
  async create(companyId: string, createDto: CreateClientProfileDto) {
    const { address, fiscalIdentity, ...clientData } = createDto;

    if (!clientData.internalCode) {
      // CORRECCIÓN: Ahora el método existe
      clientData.internalCode = await this.generateInternalCode(companyId);
    }

    const clientProfile = this.clientProfileRepository.create({
      ...clientData,
      companyId, 
      fiscalIdentity: {
        ...fiscalIdentity,
        countryCode: fiscalIdentity.countryCode?.toUpperCase() || 'ESP',
        companyId: companyId, // Multi-tenant logic
      },
      addresses: [
        {
          ...address,
          status: AddressStatus.ACTIVE,
          isDefault: true,
          companyId,
        },
      ],
    });

    try {
      return await this.clientProfileRepository.save(clientProfile);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /* ------------------------------------------------------------------
   * FIND ALL
   * ------------------------------------------------------------------ */
  // CORRECCIÓN: Implementamos el método faltante
  async findAll(companyId: string) {
    return this.clientProfileRepository.find({
      where: { companyId, isActive: true },
      relations: ['fiscalIdentity'],
      order: { createdAt: 'DESC' },
    });
  }

  /* ------------------------------------------------------------------
   * FIND ONE
   * ------------------------------------------------------------------ */
  // CORRECCIÓN: Implementamos el método faltante
  async findOne(id: string, companyId: string) {
    const client = await this.clientProfileRepository.findOne({
      where: { id, companyId, isActive: true },
      relations: ['fiscalIdentity', 'addresses'],
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado o no tienes acceso a él');
    }
    return client;
  }

  /* ------------------------------------------------------------------
   * UPDATE
   * ------------------------------------------------------------------ */
  async update(id: string, companyId: string, updateDto: UpdateClientProfileDto) {
    const client = await this.findOne(id, companyId);
    const { address, fiscalIdentity, ...crmData } = updateDto;
    Object.assign(client, crmData);
    return this.clientProfileRepository.save(client);
  }

  /* ------------------------------------------------------------------
   * REMOVE
   * ------------------------------------------------------------------ */
  async remove(id: string, companyId: string) {
    const client = await this.findOne(id, companyId);
    client.isActive = false;
    client.deletedAt = new Date();
    return this.clientProfileRepository.save(client);
  }

  /* ------------------------------------------------------------------
   * HELPERS
   * ------------------------------------------------------------------ */
  // CORRECCIÓN: Definimos el método privado
  private async generateInternalCode(companyId: string): Promise<string> {
    return `CLI-${Date.now().toString().slice(-6)}`;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      if (error.constraint === 'IDX_FISCAL_IDENTITY_PER_TENANT') {
        throw new ConflictException('Este NIF/CIF ya está registrado como cliente en tu empresa.');
      }
      if (error.detail?.includes('internal_code')) {
        throw new ConflictException('El código interno de cliente ya existe en esta empresa.');
      }
    }
    console.error(error);
    throw new InternalServerErrorException('Error al guardar el cliente');
  }
}