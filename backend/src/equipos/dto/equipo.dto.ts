import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { EstadoEquipo } from '../../common/enums';

export class CreateEquipoDto {
  @ApiProperty({ example: 'Los Pumas IPVG' })
  @IsString()
  @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'Valorant' })
  @IsString()
  @Length(2, 80, { message: 'El juego preferido debe tener entre 2 y 80 caracteres' })
  juegoPreferido: string;

  @ApiPropertyOptional({ enum: EstadoEquipo, default: EstadoEquipo.ACTIVO })
  @IsOptional()
  @IsEnum(EstadoEquipo, { message: 'Estado inválido' })
  estado?: EstadoEquipo;
}

export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}

export class AgregarIntegranteDto {
  @ApiProperty({ example: 3, description: 'id del usuario a agregar' })
  @IsInt({ message: 'usuarioId debe ser un número entero' })
  @Min(1)
  usuarioId: number;
}
