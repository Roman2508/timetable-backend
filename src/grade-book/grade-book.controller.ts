import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';

import { GradeBookService } from './grade-book.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';
import { AddSummaryDto } from './dto/add-summary.dto';
import { DeleteSummaryDto } from './dto/delete-summary.dto';

@Controller('grade-book')
@ApiTags('grade-book')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradeBookController {
  constructor(private readonly gradeBookService: GradeBookService) {}

  @Post()
  @ApiBody({ type: CreateGradeBookDto })
  create(@Body() dto: CreateGradeBookDto) {
    return this.gradeBookService.create(dto);
  }

  @Patch('/summary/add/:id')
  @ApiBody({ type: AddSummaryDto })
  addSummary(@Param('id') id: string, @Body() dto: AddSummaryDto) {
    return this.gradeBookService.addSummary(+id, dto);
  }

  @Patch('/summary/delete/:id')
  @ApiBody({ type: DeleteSummaryDto })
  deleteSummary(@Param('id') id: string, @Body() dto: DeleteSummaryDto) {
    return this.gradeBookService.deleteSummary(+id, dto);
  }

  @Get(':year/:semester/:group/:lesson/:type')
  findOne(
    @Param('year') year: string,
    @Param('semester') semester: string,
    @Param('group') group: string,
    @Param('lesson') lesson: string,
    @Param('type') type: string,
  ) {
    return this.gradeBookService.findOne(+year, +semester, +group, +lesson, type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeBookService.remove(+id);
  }
}
