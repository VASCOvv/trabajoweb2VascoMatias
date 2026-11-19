import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { EstadoInscripcion } from '../../common/enums';

export class CreateInscripcionDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'torneoId debe ser un número entero' })
  @Min(1)
  torneoId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'equipoId debe ser un número entero' })
  @Min(1)
  equipoId: number;
}

export class UpdateEstadoInscripcionDto {
  @ApiProperty({ enum: EstadoInscripcion, example: EstadoInscripcion.ACEPTADA })
  @IsEnum(EstadoInscripcion, { message: 'Estado inválido' })
  estado: EstadoInscripcion;
}
