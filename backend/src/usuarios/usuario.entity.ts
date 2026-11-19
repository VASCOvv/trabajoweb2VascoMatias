import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '../common/enums';
import { Equipo } from '../equipos/equipo.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, unique: true })
  alias: string;

  @Column({ length: 120, unique: true })
  correo: string;

  // select: false => la contraseña nunca se devuelve en las consultas normales.
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.ESTUDIANTE })
  rol: Rol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  // Un usuario puede ser capitán de varios equipos.
  @OneToMany(() => Equipo, (equipo) => equipo.capitan)
  equiposCapitan: Equipo[];

  // Un usuario puede integrar varios equipos.
  @ManyToMany(() => Equipo, (equipo) => equipo.integrantes)
  equipos: Equipo[];
}
