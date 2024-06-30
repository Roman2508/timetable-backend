import { Get, Post, Body, Patch, Param, UseGuards, Controller, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SetSubgroupsCountDto } from './dto/set-subgroups-count.dto';
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { AttachSpecializationDto } from './dto/attach-specialization.dto';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { UpdateGroupLoadLessonNameDto } from './dto/update-group-load-lesson-name.dto';
import { UpdateGroupLoadLessonHoursDto } from './dto/update-group-load-lesson-hours.dto';
import { ChangeStudentsCountByNameAndTypeDto } from './dto/change-students-count-by-name-and-type.dto';
import { AddStudentToLessonDto } from './dto/add-student-to-lesson.dto';
import { LessonsTypeRu } from 'src/grade-book/entities/grade-book.entity';

@Controller('group-load-lessons')
@ApiTags('group-load-lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupLoadLessonsController {
  constructor(private readonly groupLoadLessonsService: GroupLoadLessonsService) {}

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

  @Get('/:semester/:scheduleType/:itemId')
  findLessonsForSchedule(
    @Param('semester') semester: string,
    @Param('scheduleType') scheduleType: 'group' | 'teacher',
    @Param('itemId') itemId: string,
  ) {
    return this.groupLoadLessonsService.findLessonsForSchedule(+semester, scheduleType, +itemId);
  }

  @ApiBody({ type: UpdateGroupLoadLessonNameDto })
  @Patch('/name')
  updateName(@Body() dto: UpdateGroupLoadLessonNameDto) {
    return this.groupLoadLessonsService.updateName(dto);
  }

  @ApiBody({ type: UpdateGroupLoadLessonHoursDto })
  @Patch('/hours')
  updateHours(@Body() dto: UpdateGroupLoadLessonHoursDto) {
    return this.groupLoadLessonsService.updateHours(dto);
  }

  @Get('/students/:semester/:lessonId/:typeRu/:specialization?/:stream?')
  updateStudents(
    @Param('semester') semester: number,
    @Param('lessonId') lessonId: number,
    @Param('typeRu') typeRu: LessonsTypeRu,
    @Param('specialization') specialization: string | null,
    @Param('stream') stream?: number,
  ) {
    return this.groupLoadLessonsService.getLessonStudents(+semester, +lessonId, typeRu, specialization, stream);
  }

  @ApiBody({ type: AddStudentToLessonDto })
  @Patch('/students')
  addStudentToLesson(@Body() dto: AddStudentToLessonDto) {
    return this.groupLoadLessonsService.addStudentToLesson(dto);
  }

  @Delete('/students/:lessonId/:studentId')
  deleteStudentFromLesson(@Param('lessonId') lessonId: string, @Param('studentId') studentId: string) {
    return this.groupLoadLessonsService.deleteStudentFromLesson(+lessonId, +studentId);
  }

  // @ApiBody({ type: ChangeStudentsCountByNameAndTypeDto })
  // @Patch('/students')
  // updateStudents(@Body() dto: ChangeStudentsCountByNameAndTypeDto) {
  //   return this.groupLoadLessonsService.changeStudentsCountByNameAndType(dto);
  // }

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
  attachTeacher(@Param('lessonId') lessonId: string, @Param('teacherId') teacherId: string) {
    return this.groupLoadLessonsService.attachTeacher(+lessonId, +teacherId);
  }

  @Patch('unpin-teacher/:lessonId')
  unpinTeacher(@Param('lessonId') lessonId: string) {
    return this.groupLoadLessonsService.unpinTeacher(+lessonId);
  }
}
