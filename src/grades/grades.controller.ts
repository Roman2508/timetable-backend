import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards } from '@nestjs/common';

import { GradesService } from './grades.service';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateGradesDto } from './dto/update-grades.dto';
import { CreateGradesDto } from './dto/create-grades.dto';
import { DeleteGradesDto } from './dto/delete-grades.dto';

@Controller('grades')
@ApiTags('grades')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() dto: CreateGradesDto) {
    return this.gradesService.create(dto);
  }

  @Patch('/delete')
  delete(@Body() dto: DeleteGradesDto) {
    return this.gradesService.delete(dto);
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
}
