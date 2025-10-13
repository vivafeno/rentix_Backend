import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  async findAll() {
    return this.contactService.findAll(); // Solo contactos activos (active: true)
  }

  @Get('inactive')
  async findInactive() {
    return this.contactService.findInactive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.contactService.findOne(id);
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return contact;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.contactService.remove(id); // softdelete
    if (!deleted) throw new NotFoundException('Contacto no encontrado');
    return deleted;
  }
}
