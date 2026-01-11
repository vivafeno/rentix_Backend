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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { WithholdingRateService } from './withholding-rate.service';
import { CreateWithholdingRateDto, UpdateWithholdingRateDto } from './dto/';
import { WithholdingRate } from './withholding-rate.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

@ApiTags('Withholding Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.SUPERADMIN, AppRole.ADMIN)
@Controller('withholding-rates')
export class WithholdingRateController {
  constructor(
    private readonly withholdingRateService: WithholdingRateService,
  ) {}

  /* ─────────────────────────────────────
   * Crear retención
   * ───────────────────────────────────── */
  @Post()
  @ApiOperation({ summary: 'Crear tipo de retención' })
  @ApiResponse({
    status: 201,
    description: 'Retención creada correctamente',
    type: WithholdingRate,
  })
  create(@Body() dto: CreateWithholdingRateDto) {
    return this.withholdingRateService.create(dto);
  }

  /* ─────────────────────────────────────
   * Listar retenciones por país
   * ───────────────────────────────────── */
  @Get()
  @ApiOperation({
    summary: 'Listar tipos de retención por país',
  })
  @ApiQuery({
    name: 'countryCode',
    required: true,
    example: 'ES',
  })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de retenciones',
    type: [WithholdingRate],
  })
  findAll(
    @Query('countryCode') countryCode: string,
    @Query('showInactive') showInactive?: string,
  ) {
    return this.withholdingRateService.findAll(countryCode, {
      includeInactive: showInactive === 'true',
    });
  }

  /* ─────────────────────────────────────
   * Obtener retención concreta
   * ───────────────────────────────────── */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una retención concreta' })
  @ApiParam({ name: 'id', description: 'UUID de la retención' })
  async findOne(@Param('id') id: string) {
    const rate = await this.withholdingRateService.findOne(id);
    if (!rate) {
      throw new NotFoundException('Retención no encontrada');
    }
    return rate;
  }

  /* ─────────────────────────────────────
   * Actualizar retención
   * ───────────────────────────────────── */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de retención' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWithholdingRateDto,
  ) {
    const rate = await this.withholdingRateService.update(id, dto);
    if (!rate) {
      throw new NotFoundException('Retención no encontrada');
    }
    return rate;
  }

  /* ─────────────────────────────────────
   * Desactivar retención
   * ───────────────────────────────────── */
  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar tipo de retención',
  })
  async deactivate(@Param('id') id: string) {
    const ok = await this.withholdingRateService.deactivate(id);
    if (!ok) {
      throw new NotFoundException(
        'Retención no encontrada o ya inactiva',
      );
    }
    return { message: 'Retención desactivada correctamente' };
  }
}
