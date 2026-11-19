import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PartidosService } from './partidos.service';
import { CreatePartidoDto, UpdatePartidoDto } from './dto/partido.dto';
import { Public, Roles } from '../common/decorators';
import { EstadoPartido, Rol } from '../common/enums';

@ApiTags('Partidos')
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar partidos (calendario) con filtros' })
  @ApiQuery({ name: 'torneoId', required: false })
  @ApiQuery({ name: 'equipoId', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoPartido })
  findAll(
    @Query('torneoId') torneoId?: string,
    @Query('equipoId') equipoId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.partidosService.findAll({
      torneoId: Number(torneoId) || undefined,
      equipoId: Number(equipoId) || undefined,
      estado,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un partido con su resultado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Programar partido (solo ADMIN)' })
  create(@Body() dto: CreatePartidoDto) {
    return this.partidosService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Reprogramar / cancelar partido (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartidoDto) {
    return this.partidosService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar partido (solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.remove(id);
  }
}
