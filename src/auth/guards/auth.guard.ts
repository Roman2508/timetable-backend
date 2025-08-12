import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { UsersService } from 'src/users/users.service'
import * as cookie from 'cookie'

const PUBLIC_PATHS = [
  { method: 'POST', path: '/auth/login' },
  { method: 'GET', path: '/auth/refresh' },
  { method: 'POST', path: '/auth/logout' },
  // добавь сюда другие публичные маршруты
]

function isPublicRoute(req: Request) {
  const url = req.originalUrl ?? req.url ?? ''
  return PUBLIC_PATHS.some((p) => req.method === p.method && url.startsWith(p.path))
}

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request

    console.log(request.headers['authorization'])

    if (isPublicRoute(request)) return true

    const authHeader = request.headers['authorization']

    let token

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // fallback: допустим, у тебя ещё есть старый cookie.token — временная совместимость
      const cookies = cookie.parse(request.headers.cookie || '')
      token = cookies[process.env.TOKEN_NAME]
    }

    if (!token) {
      throw new UnauthorizedException('Відсутній токен')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token)
      const user = await this.usersService.findById(payload.id)

      if (!user) throw new UnauthorizedException('Такого користувача не знайдено')

      request.user = user

      return true
    } catch (err) {
      throw new UnauthorizedException('Access token не валідний або закінчився термін його дії')
    }
  }

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const request = context.switchToHttp().getRequest() as Request
  //   const response = context.switchToHttp().getResponse() as Response

  //   if (request.method === 'POST' && request.path === '/auth/login') return true

  //   if (request.path === '/init-application') {
  //     const isUsersExists = await this.usersService.checkIsUsersExists()

  //     if (isUsersExists) throw new ForbiddenException('Доступ заборонений')

  //     return true
  //   }

  //   const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {}
  //   const token = cookies[process.env.TOKEN_NAME]

  //   // const token = request.cookies.token;

  //   if (!token) throw new UnauthorizedException('Ви не авторизовані')

  //   let tokenPayload
  //   try {
  //     tokenPayload = await this.jwtService.verifyAsync(token)
  //   } catch {
  //     throw new UnauthorizedException('Токен не валідний або закінчився термін його дії')
  //   }

  //   const { id } = tokenPayload

  //   if (!id) throw new UnauthorizedException('Ви не авторизовані')

  //   const user = await this.usersService.findById(id)

  //   if (!user) {
  //     response.clearCookie(process.env.TOKEN_NAME, {
  //       httpOnly: true,
  //       secure: false,
  //       sameSite: 'lax',
  //       path: '/',
  //     })

  //     throw new UnauthorizedException('Ви не авторизовані')
  //   }

  //   await this.usersService.updateLastLoginTime(id)

  //   const accessToken = await this.jwtService.signAsync({ id }, { expiresIn: '30d' })

  //   response.cookie(process.env.TOKEN_NAME, accessToken, {
  //     httpOnly: true,
  //     secure: false,
  //     sameSite: 'lax',
  //     path: '/',
  //     maxAge: +process.env.TOKEN_MAX_AGE,
  //   })

  //   request.user = user

  //   return true
  // }
}
