import { SetMetadata } from '@nestjs/common'

export const PERMISSION_CHECK_KEY = 'permission_check'

export const CheckPermission = (page: string, action: 'read' | 'edit') =>
  SetMetadata(PERMISSION_CHECK_KEY, { page, action })
