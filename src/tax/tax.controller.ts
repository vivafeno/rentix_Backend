import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto';
import { Tax } from './entities/tax.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('taxes')
@Auth()
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo impuesto' })
  async create(
    @Body() dto: CreateTaxDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') role: CompanyRole,
  ): Promise<Tax> {
    return await this.taxService.create(companyId, dto, role);
  }

  @Get()
  @ApiOperation({ summary: 'Listar impuestos' })
  async findAll(@GetUser('activeCompanyId') companyId: string): Promise<Tax[]> {
    return await this.taxService.findAll(companyId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar impuesto de papelera' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') role: CompanyRole,
  ): Promise<Tax> {
    return await this.taxService.restore(id, companyId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrado lógico' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') role: CompanyRole,
  ): Promise<Tax> {
    return await this.taxService.remove(id, companyId, role);
  }
}