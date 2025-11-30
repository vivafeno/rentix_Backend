import { Entity, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';

export enum TipoContactoInterno {
  DIRECCION = 'DIRECCION',
  EMERGENCIAS = 'EMERGENCIAS',
  GESTORIA = 'GESTORIA',
  ADMINISTRACION = 'ADMINISTRACION',
  PERSONAL = 'PERSONAL',
  OTRO = 'OTRO'
}

export enum TipoContactoInterno {
  General = 'General',
  Emergencias = 'Emergencias',
  Otro = 'Otro'
}


@Entity()
export class Contact extends BaseEntity {
  @ApiProperty({
    example: 'Ana López',
    description: 'Nombre completo del contacto interno'
  })
  @Column()
  nombre: string;

  @ApiProperty({
    enum: TipoContactoInterno,
    example: TipoContactoInterno.General,
    description: 'Tipo de contacto interno'
  })
  @Column({ type: 'enum', enum: TipoContactoInterno })
  tipoContacto: TipoContactoInterno;

  @ApiPropertyOptional({
    example: 'ana.lopez@ejemplo.com',
    description: 'Correo electrónico (opcional)'
  })
  @Column({ nullable: true })
  email: string;

  @ApiPropertyOptional({
    example: '612345678',
    description: 'Teléfono de contacto (opcional)'
  })
  @Column({ nullable: true })
  telefono: string;

  @ApiPropertyOptional({
    example: 'Directora técnica',
    description: 'Cargo en la empresa (opcional)'
  })
  @Column({ nullable: true })
  cargo: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección puntual del contacto (opcional)'
  })
  @Column({ nullable: true })
  direccion: string;

  // Cuando añadas relaciones, añade @ApiProperty({ ... }) también a esos campos.
}
