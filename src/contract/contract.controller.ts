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
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class ContractController
 * @description Orquestador del ciclo de vida de contratos.
 * Aplica restricciones de seguridad por AppRole (ADMIN/SUPERADMIN) y CompanyRole (OWNER).
 * @author Rentix 2026
 * @version 1.0.0
 */
@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  /**
   * @method create
   * @description Registra un nuevo contrato vinculando el contexto de empresa.
   * Restricción: Solo perfiles de gestión técnica o propietarios.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN) // Solo gestión alta a nivel App
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

  /**
   * @method findAll
   * @description Lista los contratos activos de la empresa del usuario.
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar contratos de la empresa' })
  @ApiResponse({ status: 200, type: [Contract] })
  async findAll(@GetUser('companyId') companyId: string): Promise<Contract[]> {
    return this.contractService.findAll(companyId);
  }

  /**
   * @method findOne
   * @description Detalle de un contrato específico con validación de pertenencia.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un contrato' })
  @ApiResponse({ status: 200, type: Contract })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
  ): Promise<Contract> {
    return this.contractService.findOne(id, companyId);
  }

  /**
   * @method update
   * @description Actualización de términos contractuales.
   * Restricción: SUPERADMIN, ADMIN o el OWNER de la empresa.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un contrato' })
  @ApiResponse({ status: 200, type: Contract })
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

  /**
   * @method remove
   * @description Baja lógica manual (isActive = false, deletedAt = now).
   * Restricción: Solo permitida para perfiles de máximo privilegio.
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado lógico de contrato' })
  @ApiResponse({
    status: 200,
    description: 'Contrato desactivado correctamente',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('companyId') companyId: string,
    @GetUser('companyRole') companyRole: CompanyRole,
  ): Promise<void> {
    return this.contractService.remove(id, companyId, companyRole);
  }
}
