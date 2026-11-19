import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Rol } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuariosRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const correo = dto.correo.toLowerCase().trim();
    const existe = await this.usuariosRepo.findOne({
      where: [{ correo }, { alias: dto.alias }],
    });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese correo o alias');
    }

    const usuario = this.usuariosRepo.create({
      nombre: dto.nombre,
      alias: dto.alias,
      correo,
      password: await bcrypt.hash(dto.password, 10),
      rol: Rol.ESTUDIANTE, // el registro público siempre crea estudiantes
    });
    const guardado = await this.usuariosRepo.save(usuario);
    return this.generarRespuesta(guardado);
  }

  async login(dto: LoginDto) {
    // addSelect porque password tiene select: false en la entidad
    const usuario = await this.usuariosRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.correo = :correo', { correo: dto.correo.toLowerCase().trim() })
      .getOne();

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está desactivado');
    }
    return this.generarRespuesta(usuario);
  }

  private generarRespuesta(usuario: Usuario) {
    const payload = { sub: usuario.id, correo: usuario.correo, rol: usuario.rol };
    const { password, ...datos } = usuario;
    return {
      access_token: this.jwtService.sign(payload),
      usuario: datos,
    };
  }
}
