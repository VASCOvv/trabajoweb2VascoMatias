import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo, Usuario])],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
