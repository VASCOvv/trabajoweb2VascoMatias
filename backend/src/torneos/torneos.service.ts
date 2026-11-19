import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Torneo } from './torneo.entity';
import { Partido } from '../partidos/partido.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { CreateTorneoDto, UpdateTorneoDto } from './dto/torneo.dto';
import { EstadoInscripcion } from '../common/enums';
import { calcularRanking } from './ranking';

export interface FiltrosTorneo {
  q?: string;
  videojuego?: string;
  estado?: string;
  modalidad?: string;
  desde?: string;
}

@Injectable()
export class TorneosService {
  constructor(
    @InjectRepository(Torneo) private readonly repo: Repository<Torneo>,
    @InjectRepository(Partido) private readonly partidosRepo: Repository<Partido>,
    @InjectRepository(Inscripcion) private readonly inscripcionesRepo: Repository<Inscripcion>,
  ) {}

  findAll(filtros: FiltrosTorneo = {}) {
    const qb = this.repo
      .createQueryBuilder('t')
      .loadRelationCountAndMap('t.totalInscritos', 't.inscripciones', 'i', (sub) =>
        sub.where('i.estado != :rech', { rech: EstadoInscripcion.RECHAZADA }),
      )
      .orderBy('t.fechaInicio', 'ASC');
    if (filtros.q) {
      qb.andWhere('(t.nombre LIKE :q OR t.videojuego LIKE :q)', { q: `%${filtros.q}%` });
    }
    if (filtros.videojuego) qb.andWhere('t.videojuego = :vj', { vj: filtros.videojuego });
    if (filtros.estado) qb.andWhere('t.estado = :estado', { estado: filtros.estado });
    if (filtros.modalidad) qb.andWhere('t.modalidad = :mod', { mod: filtros.modalidad });
    if (filtros.desde) qb.andWhere('t.fechaInicio >= :desde', { desde: filtros.desde });
    return qb.getMany();
  }

  async findOne(id: number) {
    const torneo = await this.repo.findOne({
      where: { id },
      relations: { inscripciones: { equipo: { capitan: true } } },
      order: { inscripciones: { fecha: 'ASC' } },
    });
    if (!torneo) throw new NotFoundException(`Torneo con id ${id} no existe`);
    return torneo;
  }

  create(dto: CreateTorneoDto) {
    this.validarFechas(dto.cierreInscripcion, dto.fechaInicio);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateTorneoDto) {
    const torneo = await this.findOne(id);
    this.validarFechas(
      dto.cierreInscripcion ?? torneo.cierreInscripcion,
      dto.fechaInicio ?? torneo.fechaInicio,
    );
    if (dto.cupoMaximo !== undefined) {
      const activos = torneo.inscripciones.filter((i) => i.estado !== EstadoInscripcion.RECHAZADA).length;
      if (dto.cupoMaximo < activos) {
        throw new BadRequestException(`El cupo no puede ser menor a los ${activos} equipos ya inscritos`);
      }
    }
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const torneo = await this.findOne(id);
    await this.repo.remove(torneo);
    return { mensaje: `Torneo "${torneo.nombre}" eliminado` };
  }

  /** Ranking calculado SOLO a partir de resultados oficiales (no se guarda en BD). */
  async ranking(id: number) {
    await this.findOne(id); // 404 si no existe
    const inscripciones = await this.inscripcionesRepo.find({
      where: { torneoId: id, estado: EstadoInscripcion.ACEPTADA },
      relations: { equipo: true },
    });
    const partidos = await this.partidosRepo.find({
      where: { torneoId: id },
      relations: { resultado: true },
    });
    return calcularRanking(
      inscripciones.map((i) => ({ id: i.equipo.id, nombre: i.equipo.nombre })),
      partidos,
    );
  }

  private validarFechas(cierre: string, inicio: string) {
    if (new Date(cierre) > new Date(inicio)) {
      throw new BadRequestException('El cierre de inscripción no puede ser posterior a la fecha de inicio');
    }
  }
}
