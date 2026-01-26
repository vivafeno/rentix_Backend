import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
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
 * @description Orquestador del ciclo de vida de contratos inmobiliarios.
 * Garantiza el aislamiento Multi-tenant y el tipado fuerte para el Frontend.
 */
@ApiTags('Contracts')
@ApiBearerAuth()
@ApiExtraModels(Contract) // Asegura que el modelo esté disponible en la exportación OpenAPI
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo contrato', description: 'Realiza validación de disponibilidad y persistencia atómica.' })
  @ApiResponse({ status: 201, type: Contract, description: 'Contrato creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'Conflicto: El inmueble ya está ocupado en esas fechas.' })
  async create(
    @Body() createContractDto: CreateContractDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    // Rigor: Uso de await para asegurar el ciclo de vida de la transacción
    return await this.contractService.create(
      companyId,
      createContractDto,
      companyRole,
    );
  }

  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar todos los contratos de la empresa activa' })
  @ApiResponse({ status: 200, type: [Contract] })
  async findAll(@GetUser('activeCompanyId') companyId: string): Promise<Contract[]> {
    return await this.contractService.findAll(companyId);
  }

  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle hidratado de un contrato' })
  @ApiResponse({ status: 200, type: Contract })
  @ApiResponse({ status: 404, description: 'Contrato no localizado o no pertenece a la empresa.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
  ): Promise<Contract> {
    return await this.contractService.findOne(id, companyId);
  }

  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar condiciones de un contrato' })
  @ApiResponse({ status: 200, type: Contract })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    return await this.contractService.update(
      id,
      companyId,
      updateContractDto,
      companyRole,
    );
  }

  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Restaurar un contrato tras borrado lógico' })
  @ApiResponse({ status: 200, type: Contract })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<Contract> {
    return await this.contractService.restore(id, companyId, companyRole);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado lógico de contrato (Soft Delete)' })
  @ApiResponse({ status: 204, description: 'El contrato ha sido desactivado correctamente.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<void> {
    return await this.contractService.remove(id, companyId, companyRole);
  }
}