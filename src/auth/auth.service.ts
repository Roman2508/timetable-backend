import { compare } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { Response, Request } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'

import { AuthDto } from './dto/auth.dto'
import { UsersService } from './../users/users.service'
import { RoleEntity } from 'src/roles/entities/role.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { StudentStatus } from 'src/students/entities/student.entity'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async issueAccessToken(_user: UserEntity, res: Response) {
    const { password, ...user } = _user
    const accessToken = await this.jwtService.signAsync({ user }, { expiresIn: '60m' })
    const refreshToken = await this.jwtService.signAsync({ user }, { expiresIn: '30d' })

    res.cookie(process.env.TOKEN_NAME, refreshToken, {
      httpOnly: true,
      // secure: false,
      // sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV !== 'development' ? 'strict' : 'lax',
      path: '/',
      maxAge: !isNaN(+process.env.TOKEN_MAX_AGE) ? +process.env.TOKEN_MAX_AGE : 1000 * 60 * 60 * 24 * 30,
    })

    return { accessToken }
  }

  async refreshToken(res: Response, refreshToken?: string) {
    try {
      if (!refreshToken) throw new UnauthorizedException('Ви не авторизовані')

      const payload = await this.jwtService.verifyAsync(refreshToken)
      const user = await this.usersService.findById(payload.user.id)
      console.log('user', user)

      if (!user) throw new BadRequestException('Такого користувача не знайдено')

      const { accessToken } = await this.issueAccessToken(user, res)

      await this.usersService.updateLastLoginTime(user.id)

      return { accessToken }
    } catch {
      throw new UnauthorizedException('refresh token не валідний або закінчився термін його дії')
    }
  }

  async validateUser(email: string, password: string): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Логін або пароль не вірний')
    }

    const isPasswordsTheSame = await compare(password, user.password)

    if (!isPasswordsTheSame) {
      throw new UnauthorizedException('Логін або пароль не вірний')
    }

    const { password: _, ...restult } = user

    return restult
  }

  async login(dto: { email: string; password: string }, res: Response): Promise<any> {
    const user = await this.validateUser(dto.email, dto.password)
    const isStudent = (user.roles || []).find((el) => el.key === 'student')

    // Треба зробити так щоб можна було закривати доступ не тільки студентам
    // Треба зробити так щоб можна було закривати доступ не тільки студентам
    // Треба зробити так щоб можна було закривати доступ не тільки студентам
    if (isStudent && user.student.status !== StudentStatus.STUDYING) {
      throw new UnauthorizedException('Доступ заборонений')
    }

    await this.usersService.updateLastLoginTime(user.id)

    const { accessToken } = await this.issueAccessToken(user as UserEntity, res)

    return { user, accessToken }
  }

  async register(dto: AuthDto): Promise<any> {
    const oldUser = await this.usersService.findByEmail(dto.email)

    if (oldUser) {
      throw new BadRequestException('Такий email вже зареєстрований')
    }

    const newUser = await this.usersService.create({ ...dto, role: { id: dto.role.id } as RoleEntity })
    return newUser
  }

  getProfile(req: Request) {
    return req.user
  }

  // google-login
  async getByEmail(res: Response, dto: { email?: string; token: string }) {
    const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: dto.token,
      audience: process.env.GOOGLE_AUTH_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Не вдалося перевірити Google токен')
    }

    const user = await this.usersService.findByEmail(payload.email)
    if (!user) throw new NotFoundException('Користувача з таким email не знайдено в системі')

    const { accessToken } = await this.issueAccessToken(user, res)
    console.log('Google Auth success for user:', user.email)

    const { password, ...userData } = user
    return { user: userData, accessToken }
  }

  async logout(res: Response): Promise<boolean> {
    res.clearCookie(process.env.TOKEN_NAME, {
      httpOnly: true,
      // secure: false,
      // sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV !== 'development' ? 'strict' : 'lax',
      path: '/',
    })

    return true
  }
}
