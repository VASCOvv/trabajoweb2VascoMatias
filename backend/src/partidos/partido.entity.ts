import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoPartido } from '../common/enums';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Resultado } from '../resultados/resultado.entity';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column()
  torneoId: number;

  @ManyToOne(() => Equipo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipoLocalId' })
  equipoLocal: Equipo;

  @Column()
  equipoLocalId: number;

  @ManyToOne(() => Equipo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipoVisitanteId' })
  equipoVisitante: Equipo;

  @Column()
  equipoVisitanteId: number;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ length: 50 })
  ronda: string;

  @Column({ type: 'enum', enum: EstadoPartido, default: EstadoPartido.PROGRAMADO })
  estado: EstadoPartido;

  // Partido -> Resultado (0 o 1)
  @OneToOne(() => Resultado, (resultado) => resultado.partido)
  resultado: Resultado;
}
