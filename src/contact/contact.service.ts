import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * @class ContactService
 * @description Gestión de la agenda de contactos corporativos.
 * Implementa borrado lógico y recuperación de estados para el CRM de Rentix.
 * @version 2026.1.18
 * @author Rentix
 */
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * @method create
   * @description Registra un nuevo contacto en el sistema.
   * @param {CreateContactDto} createContactDto Datos del contacto.
   * @returns {Promise<Contact>} Entidad persistida.
   */
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  /**
   * @method findAll
   * @description Lista todos los contactos operativos (isActive: true).
   */
  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un contacto activo por su UUID.
   * @throws {NotFoundException} Si el contacto no existe o está desactivado.
   */
  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, isActive: true },
    });

    if (!contact) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado.`);
    }
    return contact;
  }

  /**
   * @method findInactive
   * @description Recupera el histórico de contactos desactivados.
   */
  async findInactive(): Promise<Contact[]> {
    // 🚩 Solución linter: Añadido await para evitar promesa flotante
    return await this.contactRepository.find({
      where: { isActive: false },
      order: { deletedAt: 'DESC' },
    });
  }

  /**
   * @method update
   * @description Actualiza datos de contacto y permite la reactivación.
   */
  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    // Buscamos sin filtro de isActive para permitir reactivación desde la papelera
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado.`);
    }

    if (updateContactDto.isActive === true) {
      contact.isActive = true;
      contact.deletedAt = null;
    }

    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico del contacto.
   */
  async remove(id: string): Promise<Contact> {
    const contact = await this.findOne(id);

    contact.isActive = false;
    contact.deletedAt = new Date();

    return await this.contactRepository.save(contact);
  }
}
