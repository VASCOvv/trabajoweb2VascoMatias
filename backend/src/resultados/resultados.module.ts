import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resultado } from './resultado.entity';
import { Partido } from '../partidos/partido.entity';
import { ResultadosController } from './resultados.controller';
import { ResultadosService } from './resultados.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resultado, Partido])],
  controllers: [ResultadosController],
  providers: [ResultadosService],
})
export class ResultadosModule {}
