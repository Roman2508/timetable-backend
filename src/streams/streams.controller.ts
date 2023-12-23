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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { StreamsService } from './streams.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamNameDto } from './dto/update-stream-name.dto';
import { AddGroupToStreamDto } from './dto/add-group-to-stream.dto';
import { AddLessonsToStreamDto } from './dto/add-lessons-to-stream.dto';
import { GroupLoadLessonsService } from 'src/group-load-lessons/group-load-lessons.service';
import { RemoveLessonsFromStreamDto } from './dto/remove-lessons-from-stream.dto';

@Controller('streams')
@ApiTags('streams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreamsController {
  constructor(
    private readonly streamsService: StreamsService,
    private readonly groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  @ApiBody({ type: CreateStreamDto })
  @Post()
  create(@Body() dto: CreateStreamDto) {
    return this.streamsService.create(dto);
  }

  @Get()
  findAll() {
    return this.streamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streamsService.findOne(+id);
  }

  @Patch('name/:id')
  updateStreamName(@Param('id') id: string, @Body() dto: UpdateStreamNameDto) {
    return this.streamsService.updateStreamName(+id, dto);
  }

  @Patch('group/add/:id')
  addGroupToStream(@Param('id') id: string, @Body() dto: AddGroupToStreamDto) {
    return this.streamsService.addGroupToStream(+id, dto);
  }

  @Delete('group/remove/:streamId/:groupId')
  removeGroupFromStream(
    @Param('streamId') streamId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.streamsService.removeGroupFromStream(+streamId, +groupId);
  }

  // Об'єднати дисципліну в потік
  @ApiBody({ type: AddLessonsToStreamDto })
  @Patch('/lesson/add/:streamId')
  addLessonsToStream(
    @Param('streamId') streamId: string,
    @Body() dto: AddLessonsToStreamDto,
  ) {
    return this.groupLoadLessonsService.addLessonsToStream(+streamId, dto);
  }

  // Видалити дисципліну з потоку
  @ApiBody({ type: RemoveLessonsFromStreamDto })
  @Patch('/lesson/remove/:streamId')
  removeLessonsFromStream(
    @Param('streamId') streamId: string,
    @Body() dto: RemoveLessonsFromStreamDto,
  ) {
    return this.groupLoadLessonsService.removeLessonsFromStream(+streamId, dto);
  }

  // @Patch(':id')
  // addLessonToStream(@Param('id') id: string, @Body() dto: {}) {
  //   return this.streamsService.addGroupToStream(+id, dto);
  // }

  // @Delete(':streamId/:groupId/:lessonId')
  // removeLessonFromStream(
  //   @Param('streamId') streamId: string,
  //   @Param('groupId') groupId: string,
  //   @Param('lessonId') lessonId: string,
  // ) {
  //   return this.streamsService.removeGroupFromStream(+streamId, +groupId, +lessonId);
  // }

  // Видалити потік
  @Delete(':id')
  removeStream(@Param('id') id: string) {
    return this.streamsService.removeStream(+id);
  }
}
