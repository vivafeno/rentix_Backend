import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressStatus } from './enums/addressStatus.enum';

import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
  ) {}

  // --- LOGICA DRAFT (WIZARD) ---

  async createDraft(dto: CreateAddressDto, userId: string): Promise<Address> {
    const address = this.addressRepo.create({
      ...dto,
      status: AddressStatus.DRAFT,
      isActive: true,
      createdByUserId: userId, // Vinculamos al creador para que no se pierda
    });
    return this.addressRepo.save(address);
  }

  async findDraft(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id, status: AddressStatus.DRAFT, createdByUserId: userId },
    });
    if (!address) throw new NotFoundException('Borrador no encontrado o no te pertenece');
    return address;
  }

  async updateDraft(id: string, dto: UpdateAddressDto, userId: string): Promise<Address> {
    const address = await this.findDraft(id, userId); // Reutilizamos seguridad
    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  // --- LOGICA EMPRESA (YA CREADA) ---

  async findAllForCompany(
    companyId: string, 
    userId: string, 
    appRole: AppRole, 
    options: { includeInactive: boolean }
  ): Promise<Address[]> {
    await this.validateCompanyAccess(companyId, userId, appRole);
    
    return this.addressRepo.find({
      where: {
        companyId,
        ...(options.includeInactive ? {} : { isActive: true }),
      },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async softDeleteForCompany(
    companyId: string, 
    addressId: string, 
    userId: string, 
    appRole: AppRole
  ): Promise<boolean> {
    await this.validateCompanyAccess(companyId, userId, appRole, true); // true = requiresAdmin

    const address = await this.addressRepo.findOne({ where: { id: addressId, companyId } });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    address.isActive = false;
    address.deletedAt = new Date();
    await this.addressRepo.save(address);
    return true;
  }

  // --- HELPER SEGURIDAD ---

  private async validateCompanyAccess(
    companyId: string, 
    userId: string, 
    appRole: AppRole, 
    requiresAdmin = false
  ) {
    if (appRole === AppRole.SUPERADMIN) return;

    const userRole = await this.userCompanyRoleRepo.findOne({
      where: { user: { id: userId } as any, company: { id: companyId } as any, isActive: true },
    });

    if (!userRole) throw new ForbiddenException('No tienes acceso a esta empresa');
    if (requiresAdmin && userRole.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Se requieren permisos de Propietario');
    }
  }
}