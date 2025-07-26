import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const response = context.switchToHttp().getResponse() as Response;

    if (request.method === 'POST' && request.path === '/auth/login') {
      return true; // пропустить без проверки токена
    }

    const token = request.cookies.token;

    // console.log('request.cookies', request.cookies);
    // console.log('details:', request.method, request.path);

    if (!token) {
      throw new UnauthorizedException('Ви не авторизовані');
    }

    const { id } = this.jwtService.decode(token);
    if (!id) {
      throw new UnauthorizedException('Ви не авторизовані');
    }

    const user = await this.usersService.findById(id);
    await this.usersService.updateLastLoginTime(id);

    const accessToken = await this.jwtService.signAsync({ id }, { expiresIn: '30d' });

    response.cookie(process.env.TOKEN_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: +process.env.TOKEN_MAX_AGE,
    });

    request.user = user;

    return true;
  }
}
