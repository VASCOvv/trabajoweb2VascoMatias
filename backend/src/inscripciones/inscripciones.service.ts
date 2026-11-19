import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { CreateInscripcionDto, UpdateEstadoInscripcionDto } from './dto/inscripcion.dto';
import { UsuarioToken } from '../common/decorators';
import { EstadoEquipo, EstadoInscripcion, EstadoTorneo, Rol } from '../common/enums';

/** Fecha de hoy en formato YYYY-MM-DD (hora local). */
export function hoyISO(fecha = new Date()): string {
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${m}-${d}`;
}

/** true si la fecha de cierre ya pasó (el día del cierre todavía se acepta). */
export function inscripcionCerrada(cierreInscripcion: string, hoy = hoyISO()): boolean {
  return hoy > String(cierreInscripcion).slice(0, 10);
}

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion) private readonly repo: Repository<Inscripcion>,
    @InjectRepository(Torneo) private readonly torneosRepo: Repository<Torneo>,
    @InjectRepository(Equipo) private readonly equiposRepo: Repository<Equipo>,
  ) {}

  findAll(torneoId?: number, equipoId?: number) {
    const where: any = {};
    if (torneoId) where.torneoId = torneoId;
    if (equipoId) where.equipoId = equipoId;
    return this.repo.find({ where, relations: { torneo: true, equipo: true }, order: { fecha: 'DESC' } });
  }

  async findOne(id: number) {
    const inscripcion = await this.repo.findOne({ where: { id }, relations: { torneo: true, equipo: true } });
    if (!inscripcion) throw new NotFoundException(`Inscripción con id ${id} no existe`);
    return inscripcion;
  }

  async create(dto: CreateInscripcionDto, user: UsuarioToken) {
    const torneo = await this.torneosRepo.findOneBy({ id: dto.torneoId });
    if (!torneo) throw new NotFoundException(`Torneo con id ${dto.torneoId} no existe`);
    const equipo = await this.equiposRepo.findOneBy({ id: dto.equipoId });
    if (!equipo) throw new NotFoundException(`Equipo con id ${dto.equipoId} no existe`);

    // Solo el capitán del equipo (o un admin) puede inscribirlo.
    if (user.rol !== Rol.ADMIN && equipo.capitanId !== user.sub) {
      throw new ForbiddenException('Solo el capitán puede inscribir a su equipo');
    }
    if (equipo.estado !== EstadoEquipo.ACTIVO) {
      throw new BadRequestException('El equipo está inactivo');
    }

    // Regla: período de inscripción abierto.
    if (torneo.estado !== EstadoTorneo.ABIERTO || inscripcionCerrada(torneo.cierreInscripcion)) {
      throw new BadRequestException('El período de inscripción de este torneo está cerrado');
    }

    // Regla: no inscribirse dos veces en el mismo torneo.
    const duplicada = await this.repo.findOneBy({ torneoId: torneo.id, equipoId: equipo.id });
    if (duplicada) {
      throw new ConflictException('El equipo ya está inscrito en este torneo');
    }

    // Regla: no superar el cupo máximo (se cuentan pendientes + aceptadas).
    const ocupados = await this.repo.countBy({ torneoId: torneo.id, estado: Not(EstadoInscripcion.RECHAZADA) });
    if (ocupados >= torneo.cupoMaximo) {
      throw new BadRequestException(`El torneo alcanzó su cupo máximo de ${torneo.cupoMaximo} equipos`);
    }

    const inscripcion = await this.repo.save(this.repo.create({ torneoId: torneo.id, equipoId: equipo.id }));
    return this.findOne(inscripcion.id);
  }

  async cambiarEstado(id: number, dto: UpdateEstadoInscripcionDto) {
    const inscripcion = await this.findOne(id);
    // Si se vuelve a activar una rechazada, revisar cupo de nuevo.
    if (inscripcion.estado === EstadoInscripcion.RECHAZADA && dto.estado !== EstadoInscripcion.RECHAZADA) {
      const ocupados = await this.repo.countBy({
        torneoId: inscripcion.torneoId,
        estado: Not(EstadoInscripcion.RECHAZADA),
      });
      if (ocupados >= inscripcion.torneo.cupoMaximo) {
        throw new BadRequestException('No hay cupo disponible en el torneo');
      }
    }
    inscripcion.estado = dto.estado;
    await this.repo.save(inscripcion);
    return this.findOne(id);
  }

  async remove(id: number, user: UsuarioToken) {
    const inscripcion = await this.findOne(id);
    if (user.rol !== Rol.ADMIN && inscripcion.equipo.capitanId !== user.sub) {
      throw new ForbiddenException('Solo el capitán o un administrador pueden anular la inscripción');
    }
    await this.repo.remove(inscripcion);
    return { mensaje: 'Inscripción eliminada' };
  }
}
