import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { UpdatePerfilDto, UpdateUsuarioAdminDto } from './dto/usuario.dto';
import { Roles, UsuarioActual, UsuarioToken } from '../common/decorators';
import { Rol } from '../common/enums';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  perfil(@UsuarioActual() user: UsuarioToken) {
    return this.usuariosService.findOne(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  actualizarPerfil(@UsuarioActual() user: UsuarioToken, @Body() dto: UpdatePerfilDto) {
    return this.usuariosService.updatePerfil(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (cualquier usuario autenticado, para agregar integrantes)' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un usuario' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Roles(Rol.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Cambiar rol o activar/desactivar un usuario (solo ADMIN)' })
  updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioAdminDto) {
    return this.usuariosService.updateAdmin(id, dto);
  }
}
