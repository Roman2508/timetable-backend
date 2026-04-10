import type { UserEntity } from 'src/users/entities/user.entity'

declare global {
  namespace Express {
    interface User extends UserEntity {}

    interface Request {
      user?: UserEntity
    }
  }
}

export {}
