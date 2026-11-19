import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Camila Rojas' })
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'camiGG' })
  @IsString()
  @Length(3, 50, { message: 'El alias debe tener entre 3 y 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El alias solo puede tener letras, números y _' })
  alias: string;

  @ApiProperty({ example: 'camila@ipvg.cl' })
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @ApiProperty({ example: 'clave123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@ipvg.cl' })
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
