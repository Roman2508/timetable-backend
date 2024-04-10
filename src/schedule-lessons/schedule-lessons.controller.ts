import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScheduleLessonsService } from './schedule-lessons.service';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('schedule-lessons')
@ApiTags('schedule-lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScheduleLessonsController {
  constructor(
    private readonly scheduleLessonsService: ScheduleLessonsService,
  ) {}

  @ApiBody({ type: CreateScheduleLessonDto })
  @Post()
  create(@Body() dto: CreateScheduleLessonDto) {
    return this.scheduleLessonsService.create(dto);
  }

  @Get('overlay/:date/:lessonNumber/:auditoryId')
  getAuditoryOverlay(
    @Param('date') date: string,
    @Param('lessonNumber') lessonNumber: string,
    @Param('auditoryId') auditoryId: string,
  ) {
    return this.scheduleLessonsService.getAuditoryOverlay(
      date,
      +lessonNumber,
      +auditoryId,
    );
  }

  @Get(':semester/:type/:id')
  findAll(
    @Param('semester') semester: string,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    return this.scheduleLessonsService.findAll(+semester, type, +id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.scheduleLessonsService.findOne(+id);
  // }

  @ApiBody({ type: UpdateScheduleLessonDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleLessonDto) {
    return this.scheduleLessonsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleLessonsService.remove(+id);
  }
}
