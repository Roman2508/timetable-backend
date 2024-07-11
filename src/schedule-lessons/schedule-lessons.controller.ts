import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Get, Post, Body, Patch, Param, Delete, UseGuards, Controller, Query } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CopyWeekOfScheduleDto } from './dto/copy-week-of-schedule.dto';
import { ScheduleLessonsService } from './schedule-lessons.service';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { CopyDayOfScheduleDto } from './dto/copy-day-of-schedule.dto';
import { CreateReplacementDto } from './dto/create-replacement.dto';
import { FindAllLessonDatesForTheSemesterDto } from './dto/find-lesson-dates-for-the-semester.dto';

@Controller('schedule-lessons')
@ApiTags('schedule-lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScheduleLessonsController {
  constructor(private readonly scheduleLessonsService: ScheduleLessonsService) {}

  @ApiBody({ type: CreateScheduleLessonDto })
  @Post()
  create(@Body() dto: CreateScheduleLessonDto) {
    return this.scheduleLessonsService.create(dto);
  }

  @Get('overlay/teacher/:date/:lessonNumber')
  getTeacherOverlay(@Param('date') date: string, @Param('lessonNumber') lessonNumber: string) {
    return this.scheduleLessonsService.getTeacherOverlay(date, +lessonNumber);
  }

  @Get('overlay/:date/:lessonNumber/:auditoryId')
  getAuditoryOverlay(
    @Param('date') date: string,
    @Param('lessonNumber') lessonNumber: string,
    @Param('auditoryId') auditoryId: string,
  ) {
    return this.scheduleLessonsService.getAuditoryOverlay(date, +lessonNumber, +auditoryId);
  }

  @ApiQuery({ name: 'stream', type: String, required: false })
  @ApiQuery({ name: 'subgroupNumber', type: String, required: false })
  @ApiQuery({ name: 'specialization', type: String, required: false })
  @Get('dates')
  // findAllLessonDatesForTheSemester(@Query('query') query: FindAllLessonDatesForTheSemesterDto) {
  findAllLessonDatesForTheSemester(
    @Query('groupId') groupId: string,
    @Query('semester') semester: string,
    @Query('lessonName') lessonName: string,
    @Query('type') type: string,
    @Query('stream') stream?: string,
    @Query('subgroupNumber') subgroupNumber?: string,
    @Query('specialization') specialization?: string,
  ) {
    console.log({ groupId, semester, lessonName, type, stream, subgroupNumber, specialization });
    // return this.scheduleLessonsService.findAllLessonDatesForTheSemester({ groupId: +groupId, semester: +semester });
  }

  @Get(':semester/:type/:id')
  findAll(@Param('semester') semester: string, @Param('type') type: string, @Param('id') id: string) {
    return this.scheduleLessonsService.findAll(+semester, type, +id);
  }

  @ApiBody({ type: CopyWeekOfScheduleDto })
  @Post('/copy-week')
  copyWeekOfSchedule(@Body() dto: CopyWeekOfScheduleDto) {
    return this.scheduleLessonsService.copyWeekOfSchedule(dto);
  }

  @ApiBody({ type: CopyDayOfScheduleDto })
  @Post('/copy-day')
  copyDayOfSchedule(@Body() dto: CopyDayOfScheduleDto) {
    return this.scheduleLessonsService.copyDayOfSchedule(dto);
  }

  @ApiBody({ type: CreateReplacementDto })
  @Patch('/replacement')
  createReplacement(@Body() dto: CreateReplacementDto) {
    return this.scheduleLessonsService.createReplacement(dto);
  }

  @ApiBody({ type: CreateReplacementDto })
  @Delete('/replacement/:id')
  deleteReplacement(@Param('id') id: string) {
    return this.scheduleLessonsService.deleteReplacement(+id);
  }

  @ApiBody({ type: UpdateScheduleLessonDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleLessonDto) {
    return this.scheduleLessonsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleLessonsService.remove(+id);
  }

  // @Patch('/students/add')
  // addStudentToLesson(@Body() dto: AddStudentToLessonDto) {
  //   return this.scheduleLessonsService.addStudentToLesson(dto);
  // }

  // @Patch('/students/delete')
  // deleteStudentFromLesson(@Body() dto: DeleteStudentToLessonDto) {
  //   return this.scheduleLessonsService.deleteStudentFromLesson(dto);
  // }
}
