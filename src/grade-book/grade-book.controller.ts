import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { GradeBookService } from './grade-book.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';
import { UpdateGradeBookGradesDto } from './dto/update-grade-book-grades.dto';

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

  @Patch('grades/:id')
  @ApiBody({ type: UpdateGradeBookGradesDto })
  updateGrades(@Param('id') id: string, @Body() dto: UpdateGradeBookGradesDto) {
    return this.gradeBookService.updateGrades(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeBookService.remove(+id);
  }
}
