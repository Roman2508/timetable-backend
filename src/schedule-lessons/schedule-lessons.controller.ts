import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScheduleLessonsService } from './schedule-lessons.service';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';

@Controller('schedule-lessons')
export class ScheduleLessonsController {
  constructor(
    private readonly scheduleLessonsService: ScheduleLessonsService,
  ) {}

  @Post()
  create(@Body() dto: CreateScheduleLessonDto) {
    return this.scheduleLessonsService.create(dto);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleLessonDto) {
    return this.scheduleLessonsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleLessonsService.remove(+id);
  }
}
