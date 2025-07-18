import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';
import { UsersService } from './../users/users.service';
import { StudentStatus } from 'src/students/entities/student.entity';
import { UserEntity, UserRoles } from 'src/users/entities/user.entity';

const TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
const TOKEN_NAME = 'token';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async issueAccessToken(userId: number, res: Response): Promise<any> {
    const data = { id: userId };
    const accessToken = await this.jwtService.signAsync(data, { expiresIn: '30d' });

    res.cookie(TOKEN_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    });
  }

  async validateUser(email: string, password: string): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Логін або пароль не вірний');
    }

    const isPasswordsTheSame = await compare(password, user.password);

    if (!isPasswordsTheSame) {
      throw new UnauthorizedException('Логін або пароль не вірний');
    }

    const { password: _, ...restult } = user;

    return restult;
  }

  async login(dto: { email: string; password: string }, res: Response): Promise<any> {
    const user = await this.validateUser(dto.email, dto.password);

    if (user.role.includes(UserRoles.STUDENT) && user.student.status !== StudentStatus.STUDYING) {
      throw new UnauthorizedException('Доступ заборонений');
    }

    await this.usersService.updateLastLoginTime(user.id);

    await this.issueAccessToken(user.id, res);

    return user;
  }

  async register(dto: AuthDto): Promise<any> {
    const oldUser = await this.usersService.findByEmail(dto.email);

    if (oldUser) {
      throw new BadRequestException('Такий email вже зареєстрований');
    }

    const newUser = await this.usersService.create({ ...dto });
    return newUser;
  }

  async getMe(req: Request, res: Response) {
    const token = req.headers.cookie;

    if (!token) {
      throw new UnauthorizedException('No token');
    }

    const { id } = this.jwtService.decode(token);

    if (id) {
      const user = await this.usersService.findById(id);
      await this.usersService.updateLastLoginTime(id);
      const { password, ...rest } = user;

      await this.issueAccessToken(user.id, res);

      return rest;
    }

    return null;
  }

  async getByEmail(res: Response, email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('Такого користувача не існує');

    await this.issueAccessToken(user.id, res);

    const { password, ...rest } = user;
    return rest;
  }

  async logout(res: Response): Promise<boolean> {
    res.clearCookie(TOKEN_NAME, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return true;
  }
}
