import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { IndividualTeacherWorkService } from './individual-teacher-work.service';
import { CreateIndividualTeacherWorkDto } from './dto/create-individual-teacher-work.dto';
import { UpdateIndividualTeacherWorkDto } from './dto/update-individual-teacher-work.dto';

@Controller('individual-teacher-work')
@ApiTags('individual-teacher-work')
// @UseGuards(JwtAuthGuard)
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndividualTeacherWorkDto) {
    return this.individualTeacherWorkService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualTeacherWorkService.remove(+id);
  }
}
