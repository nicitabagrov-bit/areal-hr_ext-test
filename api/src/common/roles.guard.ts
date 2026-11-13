import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем список ролей, которые разрешены для этого метода
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Если роли не заданы, доступ разрешен всем
    }
    
    // Получаем пользователя из запроса (его кладет Passport)
    const { user } = context.switchToHttp().getRequest();
    
    // Проверяем, есть ли роль пользователя в списке разрешенных
    return requiredRoles.includes(user.role_name);
  }
}