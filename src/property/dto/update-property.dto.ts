import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
