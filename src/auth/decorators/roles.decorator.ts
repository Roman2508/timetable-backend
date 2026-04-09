import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

export type RoleKey = 'root_admin' | 'admin' | 'teacher' | 'student' | 'methodist' | 'guest'

export const Roles = (...roles: RoleKey[]) => SetMetadata(ROLES_KEY, roles)

