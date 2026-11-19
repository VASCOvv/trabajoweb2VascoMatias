import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CreateResultadoDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'partidoId debe ser un número entero' })
  @Min(1)
  partidoId: number;

  @ApiProperty({ example: 13 })
  @IsInt({ message: 'El puntaje local debe ser un número entero' })
  @Min(0, { message: 'El puntaje no puede ser negativo' })
  @Max(999)
  puntajeLocal: number;

  @ApiProperty({ example: 9 })
  @IsInt({ message: 'El puntaje visitante debe ser un número entero' })
  @Min(0, { message: 'El puntaje no puede ser negativo' })
  @Max(999)
  puntajeVisitante: number;
}

// Corregir un resultado: solo se cambian los puntajes.
export class UpdateResultadoDto extends PartialType(
  PickType(CreateResultadoDto, ['puntajeLocal', 'puntajeVisitante'] as const),
) {}
