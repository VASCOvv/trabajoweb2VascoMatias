import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';
import { UpdatePerfilDto, UpdateUsuarioAdminDto } from './dto/usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(Usuario) private readonly repo: Repository<Usuario>) {}

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const usuario = await this.repo.findOne({
      where: { id },
      relations: { equipos: true, equiposCapitan: true },
    });
    if (!usuario) throw new NotFoundException(`Usuario con id ${id} no existe`);
    return usuario;
  }

  async updatePerfil(id: number, dto: UpdatePerfilDto) {
    const usuario = await this.findOne(id);
    if (dto.alias && dto.alias !== usuario.alias) {
      const ocupado = await this.repo.findOne({ where: { alias: dto.alias, id: Not(id) } });
      if (ocupado) throw new ConflictException('Ese alias ya está en uso');
      usuario.alias = dto.alias;
    }
    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.password) usuario.password = await bcrypt.hash(dto.password, 10);
    await this.repo.save(usuario);
    return this.findOne(id);
  }

  async updateAdmin(id: number, dto: UpdateUsuarioAdminDto) {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    await this.repo.save(usuario);
    return this.findOne(id);
  }
}
