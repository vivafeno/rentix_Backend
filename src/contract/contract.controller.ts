import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserGlobalRole.SUPERADMIN,
  UserGlobalRole.ADMIN,
  UserGlobalRole.USER,
)
@Controller('companies/:companyId/contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  /* ─────────────────────────────────────
   * Crear contrato
   * ───────────────────────────────────── */
  @Post()
  @ApiOperation({
    summary: 'Crear contrato para una empresa',
    description:
      'Crea un contrato asociado a una empresa, un cliente y un inmueble. ' +
      'El contrato define las condiciones económicas y temporales, pero no genera facturas.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado correctamente',
    type: Contract,
  })
  createForCompany(
    @Param('companyId') companyId: string,
    @Body() dto: CreateContractDto,
  ) {
    return this.contractService.createForCompany(companyId, dto);
  }

  /* ─────────────────────────────────────
   * Listar contratos de una empresa
   * ───────────────────────────────────── */
  @Get()
  @ApiOperation({
    summary: 'Listar contratos de una empresa',
    description:
      'Por defecto solo devuelve contratos activos. ' +
      'Usa showInactive=true para incluir contratos inactivos.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    type: Boolean,
    description: 'Incluye contratos inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de contratos',
    type: [Contract],
  })
  findAllForCompany(
    @Param('companyId') companyId: string,
    @Query('showInactive') showInactive?: string,
  ) {
    return this.contractService.findAllForCompany(companyId, {
      includeInactive: showInactive === 'true',
    });
  }

  /* ─────────────────────────────────────
   * Obtener contrato concreto
   * ───────────────────────────────────── */
  @Get(':contractId')
  @ApiOperation({
    summary: 'Obtener un contrato concreto',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'contractId', description: 'UUID del contrato' })
  @ApiResponse({
    status: 200,
    description: 'Contrato encontrado',
    type: Contract,
  })
  async findOneForCompany(
    @Param('companyId') companyId: string,
    @Param('contractId') contractId: string,
  ) {
    const contract = await this.contractService.findOneForCompany(
      companyId,
      contractId,
    );

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contract;
  }

  /* ─────────────────────────────────────
   * Actualizar contrato
   * ───────────────────────────────────── */
  @Patch(':contractId')
  @ApiOperation({
    summary: 'Actualizar contrato',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'contractId', description: 'UUID del contrato' })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado',
    type: Contract,
  })
  async updateForCompany(
    @Param('companyId') companyId: string,
    @Param('contractId') contractId: string,
    @Body() dto: UpdateContractDto,
  ) {
    const contract = await this.contractService.updateForCompany(
      companyId,
      contractId,
      dto,
    );

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contract;
  }

  /* ─────────────────────────────────────
   * Soft delete
   * ───────────────────────────────────── */
  @Delete(':contractId')
  @ApiOperation({
    summary: 'Desactivar contrato (soft delete)',
    description:
      'Marca el contrato como inactivo (isActive=false) y cambia su estado a INACTIVO.',
  })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  @ApiParam({ name: 'contractId', description: 'UUID del contrato' })
  @ApiResponse({
    status: 200,
    description: 'Contrato desactivado correctamente',
  })
  async removeForCompany(
    @Param('companyId') companyId: string,
    @Param('contractId') contractId: string,
  ) {
    const ok = await this.contractService.softDeleteForCompany(
      companyId,
      contractId,
    );

    if (!ok) {
      throw new NotFoundException(
        'Contrato no encontrado o ya desactivado',
      );
    }

    return { message: 'Contrato desactivado correctamente' };
  }
}
