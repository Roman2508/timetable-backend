import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SetSubgroupsCountDto } from './dto/set-subgroups-count.dto';
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { AttachSpecializationDto } from './dto/attach-specialization.dto';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { UpdateGroupLoadLessonNameDto } from './dto/update-group-load-lesson-name.dto';
import { UpdateGroupLoadLessonHoursDto } from './dto/update-group-load-lesson-hours.dto';

@Controller('group-load-lessons')
@ApiTags('group-load-lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupLoadLessonsController {
  constructor(
    private readonly groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  // При прикріпленні навчального плану до групи
  @ApiBody({ type: CreateGroupLoadLessonDto })
  @Post()
  createAll(@Body() dto: CreateGroupLoadLessonDto) {
    return this.groupLoadLessonsService.createAll(dto);
  }

  @Get(':id')
  findAllByGroupId(@Param('id') id: string) {
    return this.groupLoadLessonsService.findAllByGroupId(+id);
  }

  @Get('/:semester/:groupId')
  findLessonsForSchedule(
    @Param('semester') semester: string,
    @Param('groupId') groupId: string,
  ) {
    return this.groupLoadLessonsService.findLessonsForSchedule(
      +semester,
      +groupId,
    );
  }

  @Patch('/name')
  updateName(@Body() dto: UpdateGroupLoadLessonNameDto) {
    return this.groupLoadLessonsService.updateName(dto);
  }

  @Patch('/hours')
  updateHours(@Body() dto: UpdateGroupLoadLessonHoursDto) {
    return this.groupLoadLessonsService.updateHours(dto);
  }

  @ApiBody({ type: AttachSpecializationDto })
  @Patch('/specialization')
  attachSpecialization(@Body() dto: AttachSpecializationDto) {
    return this.groupLoadLessonsService.attachSpecialization(dto);
  }

  @ApiBody({ type: SetSubgroupsCountDto })
  @Patch('/subgroups')
  setSubgroupsCount(@Body() dto: SetSubgroupsCountDto) {
    return this.groupLoadLessonsService.setSubgroupsCount(dto);
  }

  @Patch('attach-teacher/:lessonId/:teacherId')
  attachTeacher(
    @Param('lessonId') lessonId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.groupLoadLessonsService.attachTeacher(+lessonId, +teacherId);
  }

  @Patch('unpin-teacher/:lessonId')
  unpinTeacher(@Param('lessonId') lessonId: string) {
    return this.groupLoadLessonsService.unpinTeacher(+lessonId);
  }
}
