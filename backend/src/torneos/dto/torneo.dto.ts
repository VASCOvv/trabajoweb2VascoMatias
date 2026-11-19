import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { EstadoTorneo, Modalidad } from '../../common/enums';

export class CreateTorneoDto {
  @ApiProperty({ example: 'Copa Valorant IPVG 2026' })
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'Valorant' })
  @IsString()
  @Length(2, 80, { message: 'El videojuego debe tener entre 2 y 80 caracteres' })
  videojuego: string;

  @ApiProperty({ enum: Modalidad, example: Modalidad.LIGA })
  @IsEnum(Modalidad, { message: 'La modalidad debe ser LIGA o ELIMINACION' })
  modalidad: Modalidad;

  @ApiPropertyOptional({ example: 'Torneo 5v5 para estudiantes de la sede.' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: '2026-12-01' })
  @IsDateString({}, { message: 'fechaInicio debe ser una fecha válida (YYYY-MM-DD)' })
  fechaInicio: string;

  @ApiProperty({ example: '2026-11-28' })
  @IsDateString({}, { message: 'cierreInscripcion debe ser una fecha válida (YYYY-MM-DD)' })
  cierreInscripcion: string;

  @ApiProperty({ example: 8, minimum: 2, maximum: 64 })
  @IsInt({ message: 'El cupo debe ser un número entero' })
  @Min(2, { message: 'El cupo mínimo es 2 equipos' })
  @Max(64, { message: 'El cupo máximo es 64 equipos' })
  cupoMaximo: number;

  @ApiPropertyOptional({ enum: EstadoTorneo, default: EstadoTorneo.ABIERTO })
  @IsOptional()
  @IsEnum(EstadoTorneo, { message: 'Estado inválido' })
  estado?: EstadoTorneo;
}

export class UpdateTorneoDto extends PartialType(CreateTorneoDto) {}
