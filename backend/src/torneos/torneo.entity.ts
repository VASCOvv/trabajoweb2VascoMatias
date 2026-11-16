import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoTorneo, Modalidad } from '../common/enums';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';

@Entity('torneos')
export class Torneo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 80 })
  videojuego: string;

  @Column({ type: 'enum', enum: Modalidad, default: Modalidad.LIGA })
  modalidad: Modalidad;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Fechas en formato 'YYYY-MM-DD'
  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  cierreInscripcion: string;

  @Column({ type: 'int' })
  cupoMaximo: number;

  @Column({ type: 'enum', enum: EstadoTorneo, default: EstadoTorneo.ABIERTO })
  estado: EstadoTorneo;

  @CreateDateColumn()
  creadoEn: Date;

  // Equipo <-> Torneo se relaciona mediante Inscripcion.
  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.torneo)
  inscripciones: Inscripcion[];

  // Torneo -> Partido
  @OneToMany(() => Partido, (partido) => partido.torneo)
  partidos: Partido[];
}
