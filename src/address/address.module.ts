import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { AddressDraftController } from './address-draft.controller';
import { AddressDraftService } from './address-draft.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  controllers: [AddressController, AddressDraftController],
  providers: [AddressService, AddressDraftService],
  exports: [TypeOrmModule, AddressService,AddressDraftService],
})
export class AddressModule { }
