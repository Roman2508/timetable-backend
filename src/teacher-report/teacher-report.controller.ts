import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeacherReportService } from './teacher-report.service';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';

@Controller('teacher-report')
export class TeacherReportController {
  constructor(private readonly teacherReportService: TeacherReportService) {}

  @Post()
  create(@Body() createTeacherReportDto: CreateTeacherReportDto) {
    return this.teacherReportService.create(createTeacherReportDto);
  }

  @Get()
  findAll() {
    return this.teacherReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherReportDto: UpdateTeacherReportDto) {
    return this.teacherReportService.update(+id, updateTeacherReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherReportService.remove(+id);
  }
}
