import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import { Auth } from './../auth/decorators/auth.decorator';
import { GetUser } from './../auth/decorators/get-user.decorator';
import { AppRole } from './../auth/enums/user-global-role.enum';

/**
 * Controlador para la gestión del catálogo de impuestos.
 * Implementa seguridad por roles y aislamiento multi-tenant.
 * * Estándares Blueprint 2026:
 * - RBAC: Acceso unificado para perfiles operativos y administrativos.
 * - Multi-tenancy: Validación obligatoria de companyId mediante contexto de usuario.
 * - Swagger: Documentación técnica integrada para consumo desde el frontend Angular.
 * * @version 1.1.1
 * @author Rentix
 */
@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('taxes')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * Registra un nuevo impuesto en el catálogo de la empresa.
   */
  @Post()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Crear un nuevo impuesto' })
  @ApiResponse({ status: 201, type: Tax })
  public create(@Body() createTaxDto: CreateTaxDto, @GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.create(user.companyId, createTaxDto);
  }

  /**
   * Obtiene la lista de impuestos activos (operativos).
   */
  @Get()
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar impuestos activos de la empresa' })
  @ApiResponse({ status: 200, type: [Tax] })
  public findAll(@GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.findAll(user.companyId);
  }

  /**
   * Obtiene los impuestos que se encuentran en la papelera (Soft-Delete).
   */
  @Get('trash')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar impuestos eliminados (Papelera)' })
  @ApiResponse({ status: 200, type: [Tax] })
  public findAllDeleted(@GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.findAllDeleted(user.companyId);
  }

  /**
   * Obtiene el detalle de un impuesto específico.
   */
  @Get(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Obtener detalle de un impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  public findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.findOne(id, user.companyId);
  }

  /**
   * Actualiza los datos de un impuesto activo.
   */
  @Patch(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Actualizar un impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaxDto: UpdateTaxDto,
    @GetUser() user: any,
  ) {
    this.checkCompanyContext(user);
    return this.taxService.update(id, user.companyId, updateTaxDto);
  }

  /**
   * Restaura un impuesto de la papelera devolviéndolo al catálogo operativo.
   */
  @Patch(':id/restore')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Restaurar un impuesto de la papelera' })
  @ApiResponse({ status: 200, type: Tax })
  public restore(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.restore(id, user.companyId);
  }

  /**
   * Realiza un borrado lógico (mueve el registro a la papelera).
   */
  @Delete(':id')
  @Auth(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Borrado lógico de impuesto (Mover a papelera)' })
  @ApiResponse({ status: 200, type: Tax })
  public remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    this.checkCompanyContext(user);
    return this.taxService.remove(id, user.companyId);
  }

  /**
   * Validación de integridad de contexto empresarial.
   * Centraliza la verificación de companyId para garantizar el aislamiento multi-tenant.
   * @throws BadRequestException si el companyId no está presente en el token del usuario.
   */
  private checkCompanyContext(user: any): void {
    if (!user.companyId) {
      throw new BadRequestException('Contexto de empresa requerido para esta operación');
    }
  }
}