import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards } from '@nestjs/common';

import { GradesService } from './grades.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateGradesDto } from './dto/update-grades.dto';
import { CreateGradesDto } from './dto/create-grades.dto';

@Controller('grades')
@ApiTags('grades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() dto: CreateGradesDto) {
    return this.gradesService.create(dto);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateGradesDto })
  update(@Param('id') id: string, @Body() dto: UpdateGradesDto) {
    return this.gradesService.update(+id, dto);
  }

  @Get('/:semester/:studentId')
  findAll(@Param('semester') semester: string, @Param('studentId') studentId: string) {
    return this.gradesService.findAll(+semester, +studentId);
  }

  @Delete('/:studentId/:lessonId')
  delete(@Param('studentId') studentId: string, @Param('lessonId') lessonId: string) {
    return this.gradesService.delete(+studentId, +lessonId);
  }
}
