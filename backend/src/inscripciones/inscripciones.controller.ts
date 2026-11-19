import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto, UpdateEstadoInscripcionDto } from './dto/inscripcion.dto';
import { Public, Roles, UsuarioActual, UsuarioToken } from '../common/decorators';
import { Rol } from '../common/enums';

@ApiTags('Inscripciones')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar inscripciones (filtrables por torneo y equipo)' })
  @ApiQuery({ name: 'torneoId', required: false })
  @ApiQuery({ name: 'equipoId', required: false })
  findAll(@Query('torneoId') torneoId?: string, @Query('equipoId') equipoId?: string) {
    return this.inscripcionesService.findAll(Number(torneoId) || undefined, Number(equipoId) || undefined);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una inscripción' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Inscribir un equipo en un torneo (capitán o ADMIN)' })
  create(@Body() dto: CreateInscripcionDto, @UsuarioActual() user: UsuarioToken) {
    return this.inscripcionesService.create(dto, user);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Aceptar o rechazar una inscripción (solo ADMIN)' })
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoInscripcionDto) {
    return this.inscripcionesService.cambiarEstado(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Anular una inscripción (capitán o ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActual() user: UsuarioToken) {
    return this.inscripcionesService.remove(id, user);
  }
}
