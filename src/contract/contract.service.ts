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
import { Client } from 'src/client/entities/client.entity';
import { Tax } from 'src/tax/entities/tax.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const { 
      companyId, 
      propertyId, 
      clientId, 
      taxId, 
      retentionId 
    } = createContractDto;

    // 1. VALIDAR PROPIEDAD
    const property = await this.propertyRepository.findOneBy({ id: propertyId });
    if (!property) throw new NotFoundException('La propiedad no existe');
    
    // Seguridad: ¿La casa es de esta empresa?
    if (property.companyId !== companyId) {
      throw new BadRequestException('La propiedad no pertenece a la empresa indicada');
    }

    // 2. VALIDAR CLIENTE
    const client = await this.clientRepository.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException('El cliente no existe');
    
    // Seguridad: ¿El cliente es de esta empresa?
    if (client.companyId !== companyId) {
      throw new BadRequestException('El cliente no pertenece a la empresa indicada');
    }

    // 3. VALIDAR IMPUESTOS (IVA)
    const tax = await this.taxRepository.findOneBy({ id: taxId });
    if (!tax) throw new BadRequestException('El impuesto (IVA) indicado no es válido');

    // 4. CREAR CONTRATO
    const newContract = this.contractRepository.create({
      ...createContractDto,
      property, // Asignamos el objeto completo para evitar conflictos de ORM
      client,
      tax,
    });

    // 5. VALIDAR RETENCIÓN (Opcional)
    if (retentionId) {
      const retention = await this.taxRepository.findOneBy({ id: retentionId });
      if (!retention) throw new BadRequestException('La retención indicada no es válida');
      newContract.retention = retention;
    }

    return await this.contractRepository.save(newContract);
  }

  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepository.find({
      where: { companyId }, // Filtramos siempre por empresa
      relations: ['property', 'client', 'tax'], // Datos para el listado
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
    // Soft Delete gracias a tu BaseEntity
    await this.contractRepository.softRemove(contract);
  }
}