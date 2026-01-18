import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Tenant)
    private readonly clientRepository: Repository<Tenant>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) { }

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const {
      companyId,
      propertyId,
      clientId,
      taxId,
      retentionId,
      // Extraemos propiedades para usarlas, pero usaremos el DTO completo abajo
    } = createContractDto;

    // ... (TUS VALIDACIONES DE SEGURIDAD property/client/tax SE QUEDAN IGUAL) ...
    // ... Copia y pega tus validaciones aquí ...

    // 1. Validar Propiedad...
    const property = await this.propertyRepository.findOneBy({ id: propertyId });
    if (!property || property.companyId !== companyId) throw new BadRequestException('Propiedad inválida');

    // 2. Validar Cliente...
    const client = await this.clientRepository.findOneBy({ id: clientId });
    if (!client || client.companyId !== companyId) throw new BadRequestException('Cliente inválido');

    // 3. Validar Tax...
    const tax = await this.taxRepository.findOneBy({ id: taxId });
    if (!tax) throw new BadRequestException('Impuesto inválido');

    // --- CREACIÓN ---
    // Usamos 'create' asignando las propiedades una a una o fusionando con cuidado.
    // Al usar el DTO con Dates reales, el spread operator (...) debería funcionar, 
    // pero si falla, esta sintaxis es INFALIBLE:

    const newContract = new Contract();

    // 1. Copiamos todo lo del DTO (incluyendo las fechas que ya son Date)
    Object.assign(newContract, createContractDto);

    // 2. Sobrescribimos las relaciones con los objetos completos
    newContract.property = property;
    newContract.client = client;
    newContract.tax = tax;

    // 3. Retención opcional
    if (retentionId) {
      const retention = await this.taxRepository.findOneBy({ id: retentionId });
      if (!retention) throw new BadRequestException('Retención inválida');
      newContract.retention = retention;
    }

    // Guardamos
    return await this.contractRepository.save(newContract);
  }

  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepository.find({
      where: { companyId }, // Filtramos siempre por empresa (Tenant Isolation)
      relations: ['property', 'client', 'tax'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['property', 'client', 'tax', 'retention'],
    });

    if (!contract) throw new NotFoundException(`Contrato ${id} no encontrado`);
    return contract;
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    // Soft Delete: Marca deletedAt sin borrar el registro físico
    await this.contractRepository.softRemove(contract);
  }
}