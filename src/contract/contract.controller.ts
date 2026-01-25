import {
  Controller,      // 🚩 Corregido: Importado de @nestjs/common
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'; // 🚩 Este es el origen correcto para el núcleo de NestJS

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class ContractController
 * @description Orquestador del ciclo de vida de contratos.
 * @author Rentix 2026
 */
@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo contrato' })
  @ApiResponse({ status: 201, type: Contract })
  async create(
    @Body() createContractDto: CreateContractDto,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    return this.contractService.create(
      companyId,
      createContractDto,
      companyRole,
    );
  }

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar contratos de la empresa' })
  async findAll(@GetUser('companyId') companyId: string): Promise<Contract[]> {
    return this.contractService.findAll(companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un contrato' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<Contract> {
    return this.contractService.findOne(id, companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un contrato' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    return this.contractService.update(
      id,
      companyId,
      updateContractDto,
      companyRole,
    );
  }

  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Restaurar un contrato desactivado' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    return this.contractService.restore(id, companyId, companyRole);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 🚩 Responde con 204 (Rigor REST)
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado lógico de contrato' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<void> {
    return this.contractService.remove(id, companyId, companyRole);
  }
}