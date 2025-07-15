import { UserAgent } from 'src/shared/decorators/user-agent-decorator';
import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SessionService } from './session.service';
import { SessionAuthGuard } from 'src/shared/guards/session-auth.guard';

@Controller('session')
@ApiTags('session')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // Пример использования кастомного декоратора @GetUser()
  //   @UseGuards(SessionAuthGuard)
  //   @Get('profile')
  //   getProfile(@GetUser() user: any) {
  //     return this.userService.getProfile(user.id);
  //   }

  // GET /sessions/user
  @UseGuards(SessionAuthGuard)
  @Get('user')
  async findByUser(@Req() req: Request) {
    return this.sessionService.findByUser(req);
  }

  // GET /sessions/current
  @UseGuards(SessionAuthGuard)
  @Get('current')
  async findCurrent(@Req() req: Request) {
    return this.sessionService.findCurrent(req);
  }

  // POST /sessions/login
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() dto: LoginInput, @UserAgent() userAgent: string) {
    return this.sessionService.login(req, dto, userAgent, res);
  }

  // POST /sessions/logout
  @UseGuards(SessionAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    return this.sessionService.logout(req);
  }

  // POST /sessions/clear
  @Post('clear')
  async clearSession(@Req() req: Request) {
    return this.sessionService.clearSession(req);
  }

  // DELETE /sessions/:id
  @UseGuards(SessionAuthGuard)
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.remove(req, id);
  }
}
