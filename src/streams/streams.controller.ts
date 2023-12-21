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

@Controller('streams')
@ApiTags('streams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

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

  // @Patch(':id')
  // updateStreamLessons(@Param('id') id: string, @Body() dto: {}) {
  //   return this.streamsService.updateStreamName(+id, dto);
  // }

  @Delete(':id')
  removeStream(@Param('id') id: string) {
    return this.streamsService.removeStream(+id);
  }
}
