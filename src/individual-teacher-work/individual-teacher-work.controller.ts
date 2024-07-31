import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { IndividualTeacherWorkService } from './individual-teacher-work.service';
import { CreateIndividualTeacherWorkDto } from './dto/create-individual-teacher-work.dto';
import { UpdateIndividualTeacherWorkDto } from './dto/update-individual-teacher-work.dto';

@Controller('individual-teacher-work')
@ApiTags('individual-teacher-work')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IndividualTeacherWorkController {
  constructor(private readonly individualTeacherWorkService: IndividualTeacherWorkService) {}

  @Post()
  create(@Body() dto: CreateIndividualTeacherWorkDto) {
    return this.individualTeacherWorkService.create(dto);
  }

  @Get()
  findAll() {
    return this.individualTeacherWorkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.individualTeacherWorkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndividualTeacherWorkDto: UpdateIndividualTeacherWorkDto) {
    return this.individualTeacherWorkService.update(+id, updateIndividualTeacherWorkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualTeacherWorkService.remove(+id);
  }
}
