import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator.js';

// одна и та же роль может называться по-разному в базе и в декораторе
const ROLE_ALIASES: Record<string, Set<string>> = {
  'администратор': new Set(['admin', 'администратор', 'administrator']),
  'менеджер по персоналу': new Set(['hr_manager', 'менеджер по персоналу', 'manager']),
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    if (required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole = String(user?.role_name || user?.role || '')
      .toLowerCase()
      .trim();

    const allowed = required.some((r) => {
      const reqRole = String(r).toLowerCase().trim();
      const aliases = ROLE_ALIASES[reqRole];
      if (aliases) {
        return aliases.has(userRole);
      }
      return userRole === reqRole;
    });

    if (!allowed) {
      throw new ForbiddenException('Недостаточно прав');
    }
    return true;
  }
}
