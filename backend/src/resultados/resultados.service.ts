import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resultado } from './resultado.entity';
import { Partido } from '../partidos/partido.entity';
import { CreateResultadoDto, UpdateResultadoDto } from './dto/resultado.dto';
import { UsuarioToken } from '../common/decorators';
import { EstadoPartido, Modalidad } from '../common/enums';

/**
 * Determina el ganador a partir de los puntajes.
 * Devuelve el id del ganador o null si es empate.
 * Lanza error si hay empate en una modalidad que no lo permite.
 */
export function determinarGanador(
  partido: Pick<Partido, 'equipoLocalId' | 'equipoVisitanteId'>,
  puntajeLocal: number,
  puntajeVisitante: number,
  modalidad: Modalidad,
): number | null {
  if (puntajeLocal > puntajeVisitante) return partido.equipoLocalId;
  if (puntajeVisitante > puntajeLocal) return partido.equipoVisitanteId;
  if (modalidad === Modalidad.ELIMINACION) {
    throw new BadRequestException('En modalidad ELIMINACION no se permiten empates');
  }
  return null;
}

@Injectable()
export class ResultadosService {
  constructor(
    @InjectRepository(Resultado) private readonly repo: Repository<Resultado>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
  ) {}

  findAll() {
    return this.repo.find({
      relations: { partido: { equipoLocal: true, equipoVisitante: true, torneo: true }, ganador: true },
      order: { fechaRegistro: 'DESC' },
    });
  }

  async findOne(id: number) {
    const resultado = await this.repo.findOne({
      where: { id },
      relations: { partido: { equipoLocal: true, equipoVisitante: true, torneo: true }, ganador: true },
    });
    if (!resultado) throw new NotFoundException(`Resultado con id ${id} no existe`);
    return resultado;
  }

  async create(dto: CreateResultadoDto, user: UsuarioToken) {
    // Regla: el partido debe existir.
    const partido = await this.partidosRepo.findOne({
      where: { id: dto.partidoId },
      relations: { torneo: true, resultado: true },
    });
    if (!partido) throw new NotFoundException(`Partido con id ${dto.partidoId} no existe`);
    if (partido.estado === EstadoPartido.CANCELADO) {
      throw new BadRequestException('No se puede registrar resultado de un partido cancelado');
    }
    if (partido.resultado) {
      throw new ConflictException('El partido ya tiene un resultado oficial registrado');
    }

    const ganadorId = determinarGanador(partido, dto.puntajeLocal, dto.puntajeVisitante, partido.torneo.modalidad);

    const resultado = await this.repo.save(
      this.repo.create({
        partidoId: partido.id,
        puntajeLocal: dto.puntajeLocal,
        puntajeVisitante: dto.puntajeVisitante,
        ganadorId,
        registradoPor: user.sub,
      }),
    );
    await this.partidosRepo.update(partido.id, { estado: EstadoPartido.FINALIZADO });
    return this.findOne(resultado.id);
  }

  async update(id: number, dto: UpdateResultadoDto) {
    const resultado = await this.findOne(id);
    const puntajeLocal = dto.puntajeLocal ?? resultado.puntajeLocal;
    const puntajeVisitante = dto.puntajeVisitante ?? resultado.puntajeVisitante;
    const ganadorId = determinarGanador(
      resultado.partido,
      puntajeLocal,
      puntajeVisitante,
      resultado.partido.torneo.modalidad,
    );
    await this.repo.update(id, { puntajeLocal, puntajeVisitante, ganadorId });
    return this.findOne(id);
  }

  async remove(id: number) {
    const resultado = await this.findOne(id);
    await this.repo.remove(resultado);
    // El partido vuelve a quedar programado.
    await this.partidosRepo.update(resultado.partidoId, { estado: EstadoPartido.PROGRAMADO });
    return { mensaje: 'Resultado eliminado' };
  }
}
