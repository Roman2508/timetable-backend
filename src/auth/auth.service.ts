import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { AuthDto } from './dto/auth.dto';
import { UsersService } from './../users/users.service';
import { UserEntity, UserRoles } from 'src/users/entities/user.entity';
import { StudentStatus } from 'src/students/entities/student.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async issueAccessToken(userId: number): Promise<any> {
    const data = { id: userId };
    return await this.jwtService.signAsync(data, { expiresIn: '30d' });
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

  async login(dto: { email: string; password: string }): Promise<any> {
    const user = await this.validateUser(dto.email, dto.password);

    if (user.role.includes(UserRoles.STUDENT) && user.student.status !== StudentStatus.STUDYING) {
      throw new UnauthorizedException('Доступ заборонений');
    }

    await this.usersService.updateLastLoginTime(user.id);

    return {
      user,
      accessToken: await this.issueAccessToken(user.id),
    };
  }

  async register(dto: AuthDto): Promise<any> {
    const oldUser = await this.usersService.findByEmail(dto.email);

    if (oldUser) {
      throw new BadRequestException('Такий email вже зареєстрований');
    }

    const newUser = await this.usersService.create({ ...dto });

    return {
      user: newUser,
      accessToken: await this.issueAccessToken(newUser.id),
    };
  }

  async getMe(token: string) {
    const { id } = this.jwtService.decode(token);
    if (id) {
      const user = await this.usersService.findById(id);
      await this.usersService.updateLastLoginTime(id);
      const { password, ...rest } = user;
      return {
        user: rest,
        accessToken: await this.issueAccessToken(rest.id),
      };
    }

    return null;
  }

  async getByEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('Такого користувача не існує');

    const { password, ...rest } = user;
    return {
      user: rest,
      accessToken: await this.issueAccessToken(rest.id),
    };
  }
}
