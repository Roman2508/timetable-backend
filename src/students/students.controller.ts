import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { StudentsService } from './students.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@ApiTags('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get('group/:id')
  findAllByGroupId(@Param('id') id: string) {
    return this.studentsService.findAllByGroupId(+id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.studentsService.getById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
