import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResultadosService } from './resultados.service';
import { CreateResultadoDto, UpdateResultadoDto } from './dto/resultado.dto';
import { Public, Roles, UsuarioActual, UsuarioToken } from '../common/decorators';
import { Rol } from '../common/enums';

@ApiTags('Resultados')
@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar resultados oficiales' })
  findAll() {
    return this.resultadosService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un resultado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resultadosService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Registrar resultado oficial de un partido (solo ADMIN)' })
  create(@Body() dto: CreateResultadoDto, @UsuarioActual() user: UsuarioToken) {
    return this.resultadosService.create(dto, user);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Corregir resultado (solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResultadoDto) {
    return this.resultadosService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar resultado; el partido vuelve a PROGRAMADO (solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resultadosService.remove(id);
  }
}
