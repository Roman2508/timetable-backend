import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { EditorJSItem } from './entities/teacher.entity';

@Controller('teachers')
@ApiTags('teacher')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @ApiBody({ type: CreateTeacherDto })
  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Patch('/handle-visible/:id')
  handleVisible(@Param('id') id: string) {
    return this.teachersService.handleVisible(+id);
  }

  @ApiBody({ type: UpdateTeacherDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(+id, dto);
  }

  @ApiBody({ type: UpdateTeacherDto })
  @Patch('/bio/:id')
  updateBio(@Param('id') id: string, @Body() dto: EditorJSItem[]) {
    return this.teachersService.updateBio(+id, dto);
  }

  @ApiBody({ type: UpdateTeacherDto })
  @Patch('/printed-works/:id')
  updatePrintedWorks(@Param('id') id: string, @Body() dto: EditorJSItem[]) {
    return this.teachersService.updatePrintedWorks(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
