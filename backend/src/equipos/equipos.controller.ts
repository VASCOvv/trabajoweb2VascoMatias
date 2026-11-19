import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EquiposService } from './equipos.service';
import { AgregarIntegranteDto, CreateEquipoDto, UpdateEquipoDto } from './dto/equipo.dto';
import { Public, UsuarioActual, UsuarioToken } from '../common/decorators';

@ApiTags('Equipos')
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar equipos con búsqueda y filtros' })
  @ApiQuery({ name: 'q', required: false, description: 'Texto a buscar en el nombre' })
  @ApiQuery({ name: 'juego', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: ['ACTIVO', 'INACTIVO'] })
  findAll(@Query('q') q?: string, @Query('juego') juego?: string, @Query('estado') estado?: string) {
    return this.equiposService.findAll({ q, juego, estado });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un equipo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Crear equipo (el usuario autenticado queda como capitán)' })
  create(@Body() dto: CreateEquipoDto, @UsuarioActual() user: UsuarioToken) {
    return this.equiposService.create(dto, user);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Editar equipo (capitán o ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipoDto, @UsuarioActual() user: UsuarioToken) {
    return this.equiposService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar equipo (capitán o ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActual() user: UsuarioToken) {
    return this.equiposService.remove(id, user);
  }

  @ApiBearerAuth()
  @Post(':id/integrantes')
  @ApiOperation({ summary: 'Agregar integrante (capitán o ADMIN)' })
  agregarIntegrante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarIntegranteDto,
    @UsuarioActual() user: UsuarioToken,
  ) {
    return this.equiposService.agregarIntegrante(id, dto, user);
  }

  @ApiBearerAuth()
  @Delete(':id/integrantes/:usuarioId')
  @ApiOperation({ summary: 'Quitar integrante (capitán o ADMIN)' })
  quitarIntegrante(
    @Param('id', ParseIntPipe) id: number,
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @UsuarioActual() user: UsuarioToken,
  ) {
    return this.equiposService.quitarIntegrante(id, usuarioId, user);
  }
}
