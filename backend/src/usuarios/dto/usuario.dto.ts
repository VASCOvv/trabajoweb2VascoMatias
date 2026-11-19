import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { Rol } from '../../common/enums';

// Lo que el propio usuario puede modificar de su perfil.
export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'Camila Rojas' })
  @IsOptional()
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'camiGG' })
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'El alias debe tener entre 3 y 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El alias solo puede tener letras, números y _' })
  alias?: string;

  @ApiPropertyOptional({ example: 'nuevaClave123' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
}

// Lo que el administrador puede modificar de cualquier usuario.
export class UpdateUsuarioAdminDto {
  @ApiPropertyOptional({ enum: Rol })
  @IsOptional()
  @IsEnum(Rol, { message: 'Rol inválido' })
  rol?: Rol;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
