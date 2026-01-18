import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * @class UpdateTenantDto
 * @description DTO para la actualización parcial de inquilinos.
 * Mantiene la coherencia con los campos fiscales (IBAN, Residencia, Código Interno).
 * @version 2026.2.0
 */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
