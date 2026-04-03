import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { TeacherCategoriesService } from './teacher-categories.service';
import { CreateTeacherCategoryDto } from './dto/create-teacher-category.dto';
import { UpdateTeacherCategoryDto } from './dto/update-teacher-category.dto';

@Controller('teacher-categories')
@ApiTags('teacher-categories')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeacherCategoriesController {
  constructor(private readonly teacherCategoriesService: TeacherCategoriesService) {}

  @Get()
  findAll() {
    return this.teacherCategoriesService.findAll();
  }

  @ApiBody({ type: CreateTeacherCategoryDto })
  @Post()
  create(@Body() dto: CreateTeacherCategoryDto) {
    return this.teacherCategoriesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherCategoryDto) {
    return this.teacherCategoriesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherCategoriesService.remove(+id);
  }
}
