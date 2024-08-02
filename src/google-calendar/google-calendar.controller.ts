import { Get, Post, Body, Patch, Delete, UseGuards, Controller, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FindCalendarEventDto } from './dto/find-calendar-event.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateGoogleCalendarDto } from './dto/create-google-calendar.dto';
import { DeleteGoogleCalendarDto } from './dto/delete-google-calendar.dto';
import { UpdateGoogleCalendarDto } from './dto/update-google-calendar.dto';
import { UpdateGoogleCalendarEventDto } from './dto/update-google-calendar-event.dto';

@Controller('google-calendar')
@ApiTags('google-calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get()
  getCalendar() {
    return this.googleCalendarService.getCalendar();
  }

  @ApiBody({ type: FindCalendarEventDto })
  @Patch('event/:calendarId')
  deleteCalendarEvent(@Param('calendarId') calendarId: string, @Body() dto: FindCalendarEventDto) {
    return this.googleCalendarService.deleteCalendarEvent(calendarId, dto);
  }

  @ApiBody({ type: CreateGoogleCalendarDto })
  @Post()
  createCalendar(@Body() dto: CreateGoogleCalendarDto) {
    return this.googleCalendarService.createCalendar(dto);
  }

  @ApiBody({ type: UpdateGoogleCalendarEventDto })
  @Patch('update-event')
  updateCalendarEvent(@Body() dto: UpdateGoogleCalendarEventDto) {
    return this.googleCalendarService.updateCalendarEvent(dto);
  }

  @ApiBody({ type: UpdateGoogleCalendarDto })
  @Patch()
  updateCalendar(@Body() dto: UpdateGoogleCalendarDto) {
    return this.googleCalendarService.updateCalendar(dto);
  }

  @Delete()
  deleteCalendar(@Body() dto: DeleteGoogleCalendarDto) {
    return this.googleCalendarService.deleteCalendar(dto);
  }
}
