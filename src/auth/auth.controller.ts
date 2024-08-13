import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto, AuthGoogleDto, GetMeDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/register')
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  // @ApiProperty()
  @ApiBody({ type: GetMeDto })
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/me')
  async getMe(@Body() dto: { token: string }) {
    return this.authService.getMe(dto.token);
  }

  @ApiBody({ type: AuthGoogleDto })
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/google/me')
  async getByEmail(@Body() dto: { email: string }) {
    return this.authService.getByEmail(dto.email);
  }
}
