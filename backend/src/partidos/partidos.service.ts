import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partido } from './partido.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { CreatePartidoDto, UpdatePartidoDto } from './dto/partido.dto';
import { EstadoInscripcion, EstadoPartido } from '../common/enums';

export interface FiltrosPartido {
  torneoId?: number;
  equipoId?: number;
  estado?: string;
}

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido) private readonly repo: Repository<Partido>,
    @InjectRepository(Torneo) private readonly torneosRepo: Repository<Torneo>,
    @InjectRepository(Inscripcion) private readonly inscripcionesRepo: Repository<Inscripcion>,
  ) {}

  findAll(filtros: FiltrosPartido = {}) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.torneo', 'torneo')
      .leftJoinAndSelect('p.equipoLocal', 'local')
      .leftJoinAndSelect('p.equipoVisitante', 'visita')
      .leftJoinAndSelect('p.resultado', 'resultado')
      .orderBy('p.fechaHora', 'ASC');
    if (filtros.torneoId) qb.andWhere('p.torneoId = :tid', { tid: filtros.torneoId });
    if (filtros.estado) qb.andWhere('p.estado = :estado', { estado: filtros.estado });
    if (filtros.equipoId) {
      qb.andWhere('(p.equipoLocalId = :eid OR p.equipoVisitanteId = :eid)', { eid: filtros.equipoId });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const partido = await this.repo.findOne({
      where: { id },
      relations: { torneo: true, equipoLocal: true, equipoVisitante: true, resultado: { ganador: true } },
    });
    if (!partido) throw new NotFoundException(`Partido con id ${id} no existe`);
    return partido;
  }

  async create(dto: CreatePartidoDto) {
    const torneo = await this.torneosRepo.findOneBy({ id: dto.torneoId });
    if (!torneo) throw new NotFoundException(`Torneo con id ${dto.torneoId} no existe`);
    await this.validarEquipos(dto.torneoId, dto.equipoLocalId, dto.equipoVisitanteId);

    const partido = this.repo.create({ ...dto, fechaHora: new Date(dto.fechaHora) });
    const guardado = await this.repo.save(partido);
    return this.findOne(guardado.id);
  }

  async update(id: number, dto: UpdatePartidoDto) {
    const partido = await this.findOne(id);
    if (partido.estado === EstadoPartido.FINALIZADO) {
      throw new BadRequestException('No se puede modificar un partido finalizado');
    }
    if (dto.estado === EstadoPartido.FINALIZADO) {
      throw new BadRequestException('Un partido se finaliza registrando su resultado');
    }
    const local = dto.equipoLocalId ?? partido.equipoLocalId;
    const visita = dto.equipoVisitanteId ?? partido.equipoVisitanteId;
    await this.validarEquipos(partido.torneoId, local, visita);

    await this.repo.update(id, {
      ...dto,
      ...(dto.fechaHora ? { fechaHora: new Date(dto.fechaHora) } : {}),
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    const partido = await this.findOne(id);
    await this.repo.remove(partido);
    return { mensaje: 'Partido eliminado' };
  }

  /** Regla: dos equipos distintos e inscritos (ACEPTADOS) en el mismo torneo. */
  async validarEquipos(torneoId: number, localId: number, visitaId: number) {
    if (localId === visitaId) {
      throw new BadRequestException('Un partido debe enfrentar a dos equipos distintos');
    }
    const aceptados = await this.inscripcionesRepo.find({
      where: { torneoId, estado: EstadoInscripcion.ACEPTADA },
    });
    const ids = aceptados.map((i) => i.equipoId);
    if (!ids.includes(localId) || !ids.includes(visitaId)) {
      throw new BadRequestException('Ambos equipos deben tener una inscripción ACEPTADA en el torneo');
    }
  }
}
