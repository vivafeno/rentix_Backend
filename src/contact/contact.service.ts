import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>
  ) { }

  // CREATE
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }

  // READ All (Solo activos)
  findAll(): Promise<Contact[]> {
    return this.contactRepository.find({ where: { isActive: true } });
  }

  // READ by id (Solo activo)
  async findOne(id: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { id, isActive: true } });
  }

  // FIND INACTIVE
  async findInactive(): Promise<Contact[]> {
    const res = this.contactRepository.find({ where: { isActive: false } });
    return res;
  }

  // UPDATE
  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contacto no encontrado');

    if (updateContactDto.isActive === true) {
      contact.isActive = true;
      contact.deletedAt = null;
    }
    Object.assign(contact, updateContactDto);
    return this.contactRepository.save(contact);
  }

  // SOFT DELETE
  async remove(id: string): Promise<Contact> {
    const contact = await this.findOne(id);
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    contact.isActive = false;
    contact.deletedAt = new Date();
    return this.contactRepository.save(contact);
  }
}
