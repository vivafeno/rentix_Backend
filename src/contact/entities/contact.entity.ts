import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity'
import { TipoContactoInterno } from './tipo-contacto-interno.enum'; // crea este enum en el mismo módulo o common

@Entity()
export class Contact extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: TipoContactoInterno })
  tipoContacto: TipoContactoInterno;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  cargo: string;

  @Column({ nullable: true })
  direccion: string; // dirección puntual del contacto, no address entero

  // relación con empresa, cliente, user... se añade en el futuro según necesidades
}
