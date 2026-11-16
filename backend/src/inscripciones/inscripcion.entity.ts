import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { EstadoInscripcion } from '../common/enums';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';

// @Unique: regla de negocio también a nivel de base de datos:
// un equipo no puede inscribirse dos veces en el mismo torneo.
@Entity('inscripciones')
@Unique('UQ_inscripcion_torneo_equipo', ['torneoId', 'equipoId'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column()
  torneoId: number;

  @ManyToOne(() => Equipo, (equipo) => equipo.inscripciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipoId' })
  equipo: Equipo;

  @Column()
  equipoId: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.PENDIENTE })
  estado: EstadoInscripcion;
}
