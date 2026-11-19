import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoEquipo } from '../common/enums';
import { Usuario } from '../usuarios/usuario.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80, unique: true })
  nombre: string;

  // Usuario -> Equipo (capitán). Se guarda la FK capitanId.
  @ManyToOne(() => Usuario, (usuario) => usuario.equiposCapitan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'capitanId' })
  capitan: Usuario;

  @Column()
  capitanId: number;

  @Column({ length: 80 })
  juegoPreferido: string;

  @Column({ type: 'enum', enum: EstadoEquipo, default: EstadoEquipo.ACTIVO })
  estado: EstadoEquipo;

  @CreateDateColumn()
  creadoEn: Date;

  // Integrantes: tabla intermedia equipo_integrantes (equipoId, usuarioId).
  @ManyToMany(() => Usuario, (usuario) => usuario.equipos)
  @JoinTable({
    name: 'equipo_integrantes',
    joinColumn: { name: 'equipoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
  })
  integrantes: Usuario[];

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.equipo)
  inscripciones: Inscripcion[];
}
