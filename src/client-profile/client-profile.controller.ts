import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Controller('client-profile')
export class ClientProfileController {
  constructor(private readonly clientProfileService: ClientProfileService) {}

  @Post()
  create(@Body() createClientProfileDto: CreateClientProfileDto) {
    return this.clientProfileService.create(createClientProfileDto);
  }

  @Get()
  findAll() {
    return this.clientProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientProfileDto: UpdateClientProfileDto) {
    return this.clientProfileService.update(+id, updateClientProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientProfileService.remove(+id);
  }
}
