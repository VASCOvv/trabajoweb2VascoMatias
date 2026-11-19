import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Rol } from '../enums';

// @Public(): marca un endpoint que NO requiere token.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// @Roles(Rol.ADMIN): restringe un endpoint a ciertos roles.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

// Datos que guardamos dentro del token JWT.
export interface UsuarioToken {
  sub: number;
  correo: string;
  rol: Rol;
}

// @UsuarioActual(): obtiene el usuario autenticado (payload del token) en un controller.
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
