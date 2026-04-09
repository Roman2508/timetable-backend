import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY, RoleKey } from '../decorators/roles.decorator'

@Injectable()
export class RolesKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleKey[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) throw new ForbiddenException('User not found')

    const roleKeys: string[] = (user.roles ?? []).map((r: any) => r?.key).filter(Boolean)

    // root_admin bypass
    if (roleKeys.includes('root_admin')) return true

    const has = requiredRoles.some((rr) => roleKeys.includes(rr))
    if (!has) throw new ForbiddenException('Недостатньо прав')

    return true
  }
}

