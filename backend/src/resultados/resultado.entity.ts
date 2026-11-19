import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Partido } from '../partidos/partido.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('resultados')
export class Resultado {
  @PrimaryGeneratedColumn()
  id: number;

  // Un partido tiene como máximo un resultado oficial (partidoId es UNIQUE).
  @OneToOne(() => Partido, (partido) => partido.resultado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partidoId' })
  partido: Partido;

  @Column({ unique: true })
  partidoId: number;

  @Column({ type: 'int' })
  puntajeLocal: number;

  @Column({ type: 'int' })
  puntajeVisitante: number;

  // null => empate
  @ManyToOne(() => Equipo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ganadorId' })
  ganador: Equipo;

  @Column({ nullable: true })
  ganadorId: number | null;

  // Administrador que registró el resultado.
  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'registradoPor' })
  registradoPorUsuario: Usuario;

  @Column({ nullable: true })
  registradoPor: number;

  @CreateDateColumn()
  fechaRegistro: Date;
}
