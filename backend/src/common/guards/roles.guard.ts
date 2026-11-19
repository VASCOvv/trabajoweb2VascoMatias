import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';
import { Rol } from '../enums';

/**
 * Guard global de autorización por roles.
 * Se ejecuta después de AuthGuard. Si el endpoint tiene @Roles(...),
 * verifica que el rol del token esté dentro de los permitidos.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }
    return true;
  }
}
