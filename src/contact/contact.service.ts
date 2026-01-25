import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * @class ContactService
 * @description Gestión de lógica de negocio para contactos (Empresas y Tenants).
 * Implementa protocolo de Soft Delete manual mediante isActive y deletedAt.
 */
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Crea un nuevo contacto validando que tenga una asignación paterna.
   * @param createContactDto Datos del contacto
   * @returns Contacto creado
   */
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    // Regla Rentix: Un contacto debe pertenecer a una empresa O a un tenant.
    if (!createContactDto.companyId && !createContactDto.tenantId) {
      throw new BadRequestException('exception.contact.no_parent_assigned');
    }

    const newContact = this.contactRepository.create({
      ...createContactDto,
      isActive: true, // Por defecto activo
      deletedAt: null,
    });

    return await this.contactRepository.save(newContact);
  }

  /**
   * Obtiene todos los contactos activos.
   */
  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { isActive: true },
      relations: ['company', 'tenant'],
    });
  }

  /**
   * Obtiene un contacto por ID si está activo.
   */
  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, isActive: true },
      relations: ['company', 'tenant'],
    });

    if (!contact) {
      throw new NotFoundException(`exception.contact.not_found`);
    }
    return contact;
  }

  /**
   * Actualiza un contacto y gestiona el estado de activación/desactivación.
   */
  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);

    // Lógica personalizada de Soft Delete / Reactivación
    if (updateContactDto.isActive !== undefined) {
      if (updateContactDto.isActive === false) {
        contact.deletedAt = new Date();
      } else {
        contact.deletedAt = null;
      }
    }

    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  /**
   * Desactiva un contacto (Soft Delete manual).
   */
  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    
    contact.isActive = false;
    contact.deletedAt = new Date();
    
    await this.contactRepository.save(contact);
  }

  /**
   * Restaura un contacto desactivado.
   */
  async restore(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, isActive: false },
    });

    if (!contact) {
      throw new NotFoundException('exception.contact.not_found_in_trash');
    }

    contact.isActive = true;
    contact.deletedAt = null;
    
    return await this.contactRepository.save(contact);
  }
}