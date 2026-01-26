import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUUID, 
  Min, 
  ValidateIf,
  IsNotEmpty
} from 'class-validator';
import { ReceiptType } from '../entities/receipt.entity';

/**
 * @class CreateReceiptDto
 * @description Esquema de validación para la emisión de recibos de caja.
 * Exige integridad en la identificación del receptor para validez legal del PDF.
 */
export class CreateReceiptDto {
  @ApiProperty({ 
    enum: ReceiptType, 
    example: ReceiptType.DEPOSIT,
    description: 'DEPOSIT para cobros de fianza, REFUND para devoluciones' 
  })
  @IsEnum(ReceiptType)
  type!: ReceiptType;

  @ApiProperty({ 
    example: 1500.00, 
    description: 'Importe del movimiento. Mínimo 0.01€' 
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El importe debe ser superior a cero.' })
  amount!: number;

  @ApiProperty({ 
    example: 'Fianza por arrendamiento vivienda C/ Mayor 5',
    description: 'Concepto descriptivo que aparecerá en el PDF'
  })
  @IsString()
  @IsNotEmpty({ message: 'El concepto es obligatorio para la validez del recibo.' })
  concept!: string;

  @ApiPropertyOptional({ 
    description: 'UUID del TenantProfile (CRM). Obligatorio si no se aporta manualTenantName.',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido.' })
  @ValidateIf(o => !o.manualTenantName) // Si no hay nombre manual, este campo es requerido
  @IsNotEmpty({ message: 'Debe seleccionar un inquilino o indicar un nombre manual.' })
  tenantId?: string;

  @ApiPropertyOptional({ 
    description: 'Nombre del receptor si no existe perfil en el CRM.',
    example: 'Juan Pérez García'
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => !o.tenantId) // Si no hay ID de inquilino, este campo es requerido
  @IsNotEmpty({ message: 'Debe indicar un nombre de receptor si no selecciona un inquilino de la lista.' })
  manualTenantName?: string;
}