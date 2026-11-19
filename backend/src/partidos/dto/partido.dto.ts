import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { EstadoPartido } from '../../common/enums';

export class CreatePartidoDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'torneoId debe ser un número entero' })
  @Min(1)
  torneoId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'equipoLocalId debe ser un número entero' })
  @Min(1)
  equipoLocalId: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'equipoVisitanteId debe ser un número entero' })
  @Min(1)
  equipoVisitanteId: number;

  @ApiProperty({ example: '2026-12-02T18:00:00' })
  @IsDateString({}, { message: 'fechaHora debe ser una fecha y hora válida' })
  fechaHora: string;

  @ApiProperty({ example: 'Fecha 1' })
  @IsString()
  @Length(1, 50, { message: 'La ronda debe tener entre 1 y 50 caracteres' })
  ronda: string;
}

// Al editar no se cambia el torneo; los equipos sí (se vuelven a validar).
export class UpdatePartidoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  equipoLocalId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  equipoVisitanteId?: number;

  @ApiPropertyOptional({ example: '2026-12-02T20:00:00' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaHora debe ser una fecha y hora válida' })
  fechaHora?: string;

  @ApiPropertyOptional({ example: 'Semifinal' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  ronda?: string;

  @ApiPropertyOptional({ enum: [EstadoPartido.PROGRAMADO, EstadoPartido.CANCELADO] })
  @IsOptional()
  @IsEnum(EstadoPartido)
  estado?: EstadoPartido;
}
