import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClientProfile } from './entities/client-profile.entity';
import { Company } from 'src/company/entities/company.entity';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientProfileService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly clientRepo: Repository<ClientProfile>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  // ➕ Crear cliente para una empresa
  async createForCompany(
    companyId: string,
    dto: CreateClientProfileDto,
  ) {
    const company = await this.companyRepo.findOne({
      where: { id: companyId, isActive: true },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const client = this.clientRepo.create({
      ...dto,
      company,
    });

    return this.clientRepo.save(client);
  }

  // 📄 Listar clientes de una empresa
  async findAllForCompany(companyId: string) {
    return this.clientRepo.find({
      where: {
        company: { id: companyId },
        isActive: true,
      },
      relations: ['addresses'],
      order: { createdAt: 'DESC' },
    });
  }

  // 🔍 Obtener cliente
  async findOne(id: string) {
    const client = await this.clientRepo.findOne({
      where: { id, isActive: true },
      relations: ['addresses'],
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  // ✏️ Actualizar cliente
  async update(id: string, dto: UpdateClientProfileDto) {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  // 🗑️ Soft delete
  async softDelete(id: string) {
    const client = await this.findOne(id);
    client.isActive = false;
    await this.clientRepo.save(client);
    return { message: 'Cliente desactivado correctamente' };
  }
}
