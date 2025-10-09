import type { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

import { UsersService } from 'src/users/users.service'

const PUBLIC_PATHS = [
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/refresh' },
  { method: 'POST', path: '/auth/logout' },
  { method: 'GET', path: '/init-application' },
]

function isPublicRoute(req: Request) {
  const url = req.originalUrl ?? req.url ?? ''
  return PUBLIC_PATHS.some((p) => req.method === p.method && url.startsWith(p.path))
}

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request

    // console.log('method:', request.method, 'path:', request.path)

    if (isPublicRoute(request)) return true

    const authHeader = request.headers['authorization']

    let token

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
    // else {
    //   // fallback: допустим, у тебя ещё есть старый cookie.token — временная совместимость
    //   const cookies = cookie.parse(request.headers.cookie || '')
    //   token = cookies[process.env.TOKEN_NAME]
    // }

    if (!token) {
      return false
      throw new UnauthorizedException('Відсутній токен')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token)
      const user = await this.usersService.findById(payload.id)

      if (!user) throw new UnauthorizedException('Такого користувача не знайдено')

      request.user = user

      return true
    } catch (err) {
      const errorMessage = 'Термін дії вашої сесії закінчився'
      // const errorMessage = 'Access token не валідний або закінчився термін його дії'
      throw new UnauthorizedException(errorMessage)
    }
  }

  // canActivate(context: ExecutionContext): boolean {
  //   const req = context.switchToHttp().getRequest<Request>()
  //   const refreshToken = req.cookies?.refreshToken

  //   if (!refreshToken) {
  //     throw new UnauthorizedException('No refresh token')
  //   }

  //   try {
  //     const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET })
  //     req.user = { ...payload, refreshToken }
  //     return true
  //   } catch {
  //     throw new UnauthorizedException('Invalid refresh token')
  //   }
  // }
}
