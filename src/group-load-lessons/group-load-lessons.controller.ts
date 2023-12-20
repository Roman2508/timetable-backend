import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GroupLoadLessonsService } from './group-load-lessons.service';
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

  // При подальшому створенні нових дисциплін або семестрів в плані
  // @ApiBody({ type: CreateGroupLoadLessonDto })
  // @Post()
  // createOne(@Body() dto: CreateGroupLoadLessonDto) {
  //   return this.groupLoadLessonsService.createAll(dto);
  // }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.groupLoadLessonsService.findAllByGroupId(+id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.groupLoadLessonsService.findOne(+id);
  // }

  @Patch('/name')
  updateName(@Body() dto: UpdateGroupLoadLessonNameDto) {
    return this.groupLoadLessonsService.updateName(dto);
  }

  @Patch('/hours')
  updateHours(@Body() dto: UpdateGroupLoadLessonHoursDto) {
    return this.groupLoadLessonsService.updateHours(dto);
  }
}
