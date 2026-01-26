import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class ContactService
 * @description Gestión de contactos Multi-tenant.
 * Roles soportados: OWNER (Escritura), TENANT/VIEWER (Lectura).
 */
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  /**
   * @method create
   * @description Crea un contacto vinculado a la empresa activa.
   */
  async create(
    companyId: string,
    dto: CreateContactDto,
    role: CompanyRole,
  ): Promise<Contact> {
    this.checkWriteAccess(role);

    const contact = this.contactRepo.create({
      ...dto,
      companyId,
      isActive: true,
      deletedAt: null,
    });

    try {
      return await this.contactRepo.save(contact);
    } catch (error) {
      throw new InternalServerErrorException('Fallo al persistir el contacto patrimonial.');
    }
  }

  /**
   * @method findAll
   * @description Lista los contactos del tenant actual.
   */
  async findAll(companyId: string): Promise<Contact[]> {
    return await this.contactRepo.find({
      where: { companyId, isActive: true },
      // 🚩 CORRECCIÓN: Ordenamos por createdAt ya que 'name' no existe en la entidad
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un contacto asegurando aislamiento.
   */
  async findOne(id: string, companyId: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { id, companyId, isActive: true },
    });

    if (!contact) throw new NotFoundException('Contacto no localizado.');
    return contact;
  }

  /**
   * @method update
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateContactDto,
    role: CompanyRole,
  ): Promise<Contact> {
    this.checkWriteAccess(role);
    const contact = await this.findOne(id, companyId);

    const updated = this.contactRepo.merge(contact, dto);
    
    if (dto.isActive === false) updated.deletedAt = new Date();
    if (dto.isActive === true) updated.deletedAt = null;

    return await this.contactRepo.save(updated);
  }

  /**
   * @method remove
   */
  async remove(id: string, companyId: string, role: CompanyRole): Promise<void> {
    this.checkWriteAccess(role);
    const contact = await this.findOne(id, companyId);

    contact.isActive = false;
    contact.deletedAt = new Date();
    await this.contactRepo.save(contact);
  }

  /**
   * @method restore
   */
  async restore(id: string, companyId: string, role: CompanyRole): Promise<Contact> {
    this.checkWriteAccess(role);
    
    const contact = await this.contactRepo.findOne({
      where: { id, companyId, isActive: false },
    });

    if (!contact) throw new NotFoundException('Contacto no recuperable.');

    contact.isActive = true;
    contact.deletedAt = null;

    return await this.contactRepo.save(contact);
  }

  /* --- MÉTODOS PRIVADOS DE RIGOR --- */

  /**
   * @description Valida privilegios basados en el enum real: OWNER, TENANT, VIEWER.
   */
  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Operación restringida: Solo el propietario puede gestionar contactos.');
    }
  }
}