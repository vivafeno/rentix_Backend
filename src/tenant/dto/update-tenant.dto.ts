import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * @class UpdateTenantDto
 * @description DTO para la actualización parcial de inquilinos.
 * Blindado para evitar el cambio de Identidad Fiscal o CompanyId.
 * @version 2026.2.2
 */
export class UpdateTenantDto extends PartialType(
  // Si CreateTenantDto no tiene campos prohibidos a nivel raíz,
  // no necesitas el OmitType aquí. Úsalo solo para campos que existan en el padre.
  CreateTenantDto 
) {
  /**
   * Nota de Rigor: 
   * Los campos como bankIban, email y phone quedan como opcionales 
   * y se actualizarán mediante el método merge del Service.
   */
}