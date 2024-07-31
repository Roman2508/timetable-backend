import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TeacherReportService } from './teacher-report.service';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';

@Controller('teacher-report')
@ApiTags('teacher-report')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherReportController {
  constructor(private readonly teacherReportService: TeacherReportService) {}

  @Post()
  create(@Body() dto: CreateTeacherReportDto) {
    return this.teacherReportService.create(dto);
  }

  @Get(':id')
  findByTeacherId(@Param('id') id: string) {
    return this.teacherReportService.findByTeacherId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherReportDto) {
    return this.teacherReportService.update(+id, dto);
  }

  @Patch('file/:id')
  uploadFile(@Param('id') id: string, @Body() dto: UpdateTeacherReportDto) {
    return this.teacherReportService.uploadFile(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherReportService.remove(+id);
  }
}
