import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanCategoriesService } from './plan-categories.service';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('plan-categories')
@ApiTags('plan-categories')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanCategoriesController {
  constructor(private readonly planCategoriesService: PlanCategoriesService) {}

  @Get()
  findAll() {
    return this.planCategoriesService.findAll();
  }

  @ApiBody({ type: CreatePlanCategoryDto })
  @Post()
  create(@Body() createPlanCategoryDto: CreatePlanCategoryDto) {
    return this.planCategoriesService.create(createPlanCategoryDto);
  }

  @ApiBody({ type: UpdatePlanCategoryDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanCategoryDto) {
    return this.planCategoriesService.update(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.planCategoriesService.remove(+id);
  }
}
