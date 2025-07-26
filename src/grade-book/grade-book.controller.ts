import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';

import { AddSummaryDto } from './dto/add-summary.dto';
import { GradeBookService } from './grade-book.service';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { DeleteSummaryDto } from './dto/delete-summary.dto';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';

@Controller('grade-book')
@ApiTags('grade-book')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradeBookController {
  constructor(private readonly gradeBookService: GradeBookService) {}

  @Post()
  @ApiBody({ type: CreateGradeBookDto })
  createAll(@Body() dto: CreateGradeBookDto) {
    return this.gradeBookService.createAll(dto);
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

  @Get(':semester/:group/:lesson/:type')
  findOne(
    @Param('semester') semester: string,
    @Param('group') group: string,
    @Param('lesson') lesson: string,
    @Param('type') type: string,
  ) {
    return this.gradeBookService.findOne(+semester, +group, +lesson, type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeBookService.remove(+id);
  }
}
