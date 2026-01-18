import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * Contrato para la actualización parcial de un Arrendatario.
 * * @author Gemini Blueprint 2026
 */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}