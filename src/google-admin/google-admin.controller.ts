import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Get, UseGuards, Controller, Body, Param } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GoogleAdminService } from './google-admin.service';

// ДЛЯ ТЕСТІВ. ПОТІМ КОНТРОЛЛЕР ТРЕБА БУДЕ ВИДАЛИТИ
// ДЛЯ ТЕСТІВ. ПОТІМ КОНТРОЛЛЕР ТРЕБА БУДЕ ВИДАЛИТИ
// ДЛЯ ТЕСТІВ. ПОТІМ КОНТРОЛЛЕР ТРЕБА БУДЕ ВИДАЛИТИ
// ДЛЯ ТЕСТІВ. ПОТІМ КОНТРОЛЛЕР ТРЕБА БУДЕ ВИДАЛИТИ
// ДЛЯ ТЕСТІВ. ПОТІМ КОНТРОЛЛЕР ТРЕБА БУДЕ ВИДАЛИТИ
@Controller('google-admin')
@ApiTags('google-admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoogleAdminController {
  constructor(private readonly googleCalendarService: GoogleAdminService) {}

  @Get()
  listUsers() {
    return this.googleCalendarService.listUsers();
  }

  @Get('/authorize')
  authorize() {
    return this.googleCalendarService.authorize();
  }

  @Get('/photo/:email')
  getUserPhotoByEmail(@Param('email') email: string) {
    return this.googleCalendarService.getUserPhotoByEmail(email);
  }
}
