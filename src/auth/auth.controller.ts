import { Response, Request } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Headers, HttpCode, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Cookies } from './decorators/cookies.decorator';
import { AuthDto, AuthGoogleDto, GetMeDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/register')
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @ApiBody({ type: GetMeDto })
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/me')
  async getMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.getMe(req, res);
  }

  @ApiBody({ type: AuthGoogleDto })
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/google/me')
  async getByEmail(@Res({ passthrough: true }) res: Response, @Body() dto: { email: string }) {
    return this.authService.getByEmail(res, dto.email);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
