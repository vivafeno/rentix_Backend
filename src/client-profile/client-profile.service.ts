import { Injectable } from '@nestjs/common';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientProfileService {
  create(createClientProfileDto: CreateClientProfileDto) {
    return 'This action adds a new clientProfile';
  }

  findAll() {
    return `This action returns all clientProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientProfile`;
  }

  update(id: number, updateClientProfileDto: UpdateClientProfileDto) {
    return `This action updates a #${id} clientProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientProfile`;
  }
}
