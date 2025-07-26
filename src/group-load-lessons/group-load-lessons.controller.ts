import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Get, Post, Body, Patch, Param, UseGuards, Controller } from '@nestjs/common';

// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { SetSubgroupsCountDto } from './dto/set-subgroups-count.dto';
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { AddStudentToLessonDto } from './dto/add-student-to-lesson.dto';
import { AttachSpecializationDto } from './dto/attach-specialization.dto';
import { LessonsTypeRu } from 'src/grade-book/entities/grade-book.entity';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { DeleteStudentFromLessonDto } from './dto/delete-student-from-lesson.dto';
import { UpdateGroupLoadLessonNameDto } from './dto/update-group-load-lesson-name.dto';
import { UpdateGroupLoadLessonHoursDto } from './dto/update-group-load-lesson-hours.dto';
import { AddStudentsToAllGroupLessonsDto } from './dto/add-students-to-all-group-lessons.dto';
import { DeleteStudentsFromAllGroupLessonsDto } from './dto/delete-students-to-all-group-lessons.dto';
import { ChangeStudentsCountByNameAndTypeDto } from './dto/change-students-count-by-name-and-type.dto';

@Controller('group-load-lessons')
@ApiTags('group-load-lessons')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupLoadLessonsController {
  constructor(private readonly groupLoadLessonsService: GroupLoadLessonsService) {}

  // При прикріпленні навчального плану до групи
  @ApiBody({ type: CreateGroupLoadLessonDto })
  @Post()
  createAll(@Body() dto: CreateGroupLoadLessonDto) {
    return this.groupLoadLessonsService.createAll(dto);
  }

  @Get('/teacher/:teacherId')
  findAllTeacherLessonsById(@Param('teacherId') teacherId: string) {
    return this.groupLoadLessonsService.findAllTeacherLessonsById(+teacherId);
  }

  @Get('/instructional-materials/:teacherId/:year')
  findAllTeacherLessonsByIdAndYear(@Param('teacherId') teacherId: string, @Param('year') year: string) {
    return this.groupLoadLessonsService.findAllTeacherLessonsById(+teacherId, year);
  }

  @Get(':id')
  findAllByGroupId(@Param('id') id: string) {
    return this.groupLoadLessonsService.findAllByGroupId(+id);
  }

  @Get('/by-current-cours/:id')
  getGroupLoadByCurrentCourse(@Param('id') id: string) {
    return this.groupLoadLessonsService.getGroupLoadByCurrentCourse(+id);
  }

  @Get('/:semester/:groupId')
  findAllByGroupIdAndSemester(@Param('semester') semester: string, @Param('groupId') groupId: string) {
    return this.groupLoadLessonsService.findAllByGroupIdAndSemester(+semester, +groupId);
  }

  @Get('/students/get/:id')
  findLessonStudents(@Param('id') id: string) {
    return this.groupLoadLessonsService.findLessonStudents(+id);
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
  getLessonStudents(
    @Param('semester') semester: number,
    @Param('lessonId') lessonId: number,
    @Param('typeRu') typeRu: LessonsTypeRu,
    @Param('specialization') specialization: string | null,
    @Param('stream') stream?: number,
  ) {
    return this.groupLoadLessonsService.getLessonStudents(+semester, +lessonId, typeRu, specialization, stream);
  }

  /* students */

  @Patch('/students/add')
  @ApiBody({ type: AddStudentToLessonDto })
  addStudentToLesson(@Body() dto: AddStudentToLessonDto) {
    return this.groupLoadLessonsService.addStudentToLesson(dto);
  }

  @Patch('/students/delete')
  @ApiBody({ type: DeleteStudentFromLessonDto })
  deleteStudentFromLesson(@Body() dto: DeleteStudentFromLessonDto) {
    return this.groupLoadLessonsService.deleteStudentFromLesson(dto);
  }

  @Patch('/students/all/add')
  @ApiBody({ type: AddStudentsToAllGroupLessonsDto })
  addStudentsToAllGroupLessons(@Body() dto: AddStudentsToAllGroupLessonsDto) {
    return this.groupLoadLessonsService.addStudentsToAllGroupLessons(dto);
  }

  @Patch('/students/all/delete')
  @ApiBody({ type: DeleteStudentsFromAllGroupLessonsDto })
  deleteStudentsFromAllGroupLessons(@Body() dto: DeleteStudentsFromAllGroupLessonsDto) {
    return this.groupLoadLessonsService.deleteStudentsFromAllGroupLessons(dto);
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
  attachTeacher(@Param('lessonId') lessonId: string, @Param('teacherId') teacherId: string) {
    return this.groupLoadLessonsService.attachTeacher(+lessonId, +teacherId);
  }

  @Patch('unpin-teacher/:lessonId')
  unpinTeacher(@Param('lessonId') lessonId: string) {
    return this.groupLoadLessonsService.unpinTeacher(+lessonId);
  }
}
