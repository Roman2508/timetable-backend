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
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { UpdateGroupLoadLessonDto } from './dto/update-group-load-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('group-load-lessons')
@ApiTags('group-load-lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupLoadLessonsController {
  constructor(
    private readonly groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  @ApiBody({ type: CreateGroupLoadLessonDto })
  @Post()
  create(@Body() createGroupLoadLessonDto: CreateGroupLoadLessonDto) {
    return this.groupLoadLessonsService.create(createGroupLoadLessonDto);
  }

  @Get()
  findAll() {
    return this.groupLoadLessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupLoadLessonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupLoadLessonDto) {
    return this.groupLoadLessonsService.update(+id, dto);
  }
}
