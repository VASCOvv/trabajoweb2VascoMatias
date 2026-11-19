import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { AgregarIntegranteDto, CreateEquipoDto, UpdateEquipoDto } from './dto/equipo.dto';
import { UsuarioToken } from '../common/decorators';
import { Rol } from '../common/enums';

export interface FiltrosEquipo {
  q?: string;
  juego?: string;
  estado?: string;
}

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo) private readonly repo: Repository<Equipo>,
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  findAll(filtros: FiltrosEquipo = {}) {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.capitan', 'capitan')
      .leftJoinAndSelect('e.integrantes', 'integrantes')
      .orderBy('e.nombre', 'ASC');
    if (filtros.q) qb.andWhere('e.nombre LIKE :q', { q: `%${filtros.q}%` });
    if (filtros.juego) qb.andWhere('e.juegoPreferido = :juego', { juego: filtros.juego });
    if (filtros.estado) qb.andWhere('e.estado = :estado', { estado: filtros.estado });
    return qb.getMany();
  }

  async findOne(id: number) {
    const equipo = await this.repo.findOne({
      where: { id },
      relations: { capitan: true, integrantes: true, inscripciones: { torneo: true } },
    });
    if (!equipo) throw new NotFoundException(`Equipo con id ${id} no existe`);
    return equipo;
  }

  async create(dto: CreateEquipoDto, user: UsuarioToken) {
    await this.validarNombreUnico(dto.nombre);
    const capitan = await this.usuariosRepo.findOneBy({ id: user.sub });
    if (!capitan) throw new NotFoundException('Usuario no encontrado');

    // El creador queda como capitán y como primer integrante.
    const equipo = this.repo.create({ ...dto, capitan, integrantes: [capitan] });
    const guardado = await this.repo.save(equipo);
    return this.findOne(guardado.id);
  }

  async update(id: number, dto: UpdateEquipoDto, user: UsuarioToken) {
    const equipo = await this.findOne(id);
    this.validarPermiso(equipo, user);
    if (dto.nombre && dto.nombre !== equipo.nombre) await this.validarNombreUnico(dto.nombre);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, user: UsuarioToken) {
    const equipo = await this.findOne(id);
    this.validarPermiso(equipo, user);
    await this.repo.remove(equipo);
    return { mensaje: `Equipo "${equipo.nombre}" eliminado` };
  }

  async agregarIntegrante(id: number, dto: AgregarIntegranteDto, user: UsuarioToken) {
    const equipo = await this.findOne(id);
    this.validarPermiso(equipo, user);
    const usuario = await this.usuariosRepo.findOneBy({ id: dto.usuarioId });
    if (!usuario) throw new NotFoundException(`Usuario con id ${dto.usuarioId} no existe`);
    if (equipo.integrantes.some((i) => i.id === usuario.id)) {
      throw new ConflictException('El usuario ya es integrante del equipo');
    }
    equipo.integrantes.push(usuario);
    await this.repo.save(equipo);
    return this.findOne(id);
  }

  async quitarIntegrante(id: number, usuarioId: number, user: UsuarioToken) {
    const equipo = await this.findOne(id);
    this.validarPermiso(equipo, user);
    if (usuarioId === equipo.capitanId) {
      throw new BadRequestException('No se puede quitar al capitán del equipo');
    }
    if (!equipo.integrantes.some((i) => i.id === usuarioId)) {
      throw new NotFoundException('El usuario no es integrante del equipo');
    }
    equipo.integrantes = equipo.integrantes.filter((i) => i.id !== usuarioId);
    await this.repo.save(equipo);
    return this.findOne(id);
  }

  // Solo el capitán del equipo o un administrador pueden modificarlo.
  validarPermiso(equipo: Equipo, user: UsuarioToken) {
    if (user.rol !== Rol.ADMIN && equipo.capitanId !== user.sub) {
      throw new ForbiddenException('Solo el capitán o un administrador pueden modificar este equipo');
    }
  }

  private async validarNombreUnico(nombre: string) {
    const existe = await this.repo.findOneBy({ nombre });
    if (existe) throw new ConflictException('Ya existe un equipo con ese nombre');
  }
}
