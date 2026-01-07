import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AddressService } from './address.service';
import { Address } from './entities/address.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserGlobalRole.SUPERADMIN,
  UserGlobalRole.ADMIN,
  UserGlobalRole.USER,
)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /* ============================================================
   * COMPANY SCOPE
   * ============================================================ */

  @Get('/company/:companyId')
  @ApiOperation({
    summary: 'Listar direcciones de una empresa',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({
    description: 'Listado de direcciones de empresa',
    type: Address,
    isArray: true,
  })
  findAllForCompany(
    @Param('companyId') companyId: string,
    @Query('includeInactive') includeInactive?: 'true' | 'false',
  ): Promise<Address[]> {
    return this.addressService.findAllForCompany(companyId, {
      includeInactive: includeInactive === 'true',
    });
  }

  @Delete('/company/:companyId/:addressId')
  @ApiOperation({
    summary: 'Desactivar dirección de una empresa (soft delete)',
  })
  @ApiParam({
    name: 'companyId',
    description: 'UUID de la empresa',
  })
  @ApiParam({
    name: 'addressId',
    description: 'UUID de la dirección',
  })
  @ApiOkResponse({
    description: 'Dirección desactivada correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Dirección desactivada correctamente',
        },
      },
    },
  })
  async remove(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
  ): Promise<{ message: string }> {
    const ok = await this.addressService.softDeleteForCompany(
      companyId,
      addressId,
    );

    if (!ok) {
      throw new NotFoundException(
        'Dirección no encontrada o ya desactivada',
      );
    }

    return { message: 'Dirección desactivada correctamente' };
  }
}
