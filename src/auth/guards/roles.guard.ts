import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_CHECK_KEY } from '../decorators/check-permission.decorator'
import { UserRoles } from '../../users/entities/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<{ page: string; action: string }>(
      PERMISSION_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermission) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      throw new ForbiddenException('User not found')
    }

    // Global Admin bypass
    const isAdmin = user.roles.some((role) => role.key === UserRoles.ADMIN)
    if (isAdmin) {
      return true
    }

    const hasPermission = user.roles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.page === requiredPermission.page &&
          (permission.action === requiredPermission.action ||
            (requiredPermission.action === 'read' && permission.action === 'edit')), // Edit implies Read
      ),
    )

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    return true
  }
}
