import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TorneosService } from './torneos.service';
import { CreateTorneoDto, UpdateTorneoDto } from './dto/torneo.dto';
import { Public, Roles } from '../common/decorators';
import { EstadoTorneo, Modalidad, Rol } from '../common/enums';

@ApiTags('Torneos')
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar torneos con búsqueda y filtros combinables' })
  @ApiQuery({ name: 'q', required: false, description: 'Busca en nombre o videojuego' })
  @ApiQuery({ name: 'videojuego', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoTorneo })
  @ApiQuery({ name: 'modalidad', required: false, enum: Modalidad })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha de inicio mínima YYYY-MM-DD' })
  findAll(
    @Query('q') q?: string,
    @Query('videojuego') videojuego?: string,
    @Query('estado') estado?: string,
    @Query('modalidad') modalidad?: string,
    @Query('desde') desde?: string,
  ) {
    return this.torneosService.findAll({ q, videojuego, estado, modalidad, desde });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un torneo con sus inscripciones' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.findOne(id);
  }

  @Public()
  @Get(':id/ranking')
  @ApiOperation({ summary: 'Tabla de posiciones calculada desde los resultados oficiales' })
  ranking(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.ranking(id);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear torneo (solo ADMIN)' })
  create(@Body() dto: CreateTorneoDto) {
    return this.torneosService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Editar torneo (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTorneoDto) {
    return this.torneosService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar torneo (solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.remove(id);
  }
}
