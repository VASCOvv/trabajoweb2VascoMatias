import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Torneo } from './torneo.entity';
import { Partido } from '../partidos/partido.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { TorneosController } from './torneos.controller';
import { TorneosService } from './torneos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Torneo, Partido, Inscripcion])],
  controllers: [TorneosController],
  providers: [TorneosService],
})
export class TorneosModule {}
