import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanCategoriesService } from './plan-categories.service';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('plan-categories')
@ApiTags('plan-categories')
export class PlanCategoriesController {
  constructor(private readonly planCategoriesService: PlanCategoriesService) {}

  @Get()
  findAll() {
    return this.planCategoriesService.findAll();
  }

  @Post()
  create(@Body() createPlanCategoryDto: CreatePlanCategoryDto) {
    return this.planCategoriesService.create(createPlanCategoryDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.planCategoriesService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanCategoryDto: UpdatePlanCategoryDto,
  ) {
    return this.planCategoriesService.update(+id, updatePlanCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planCategoriesService.remove(+id);
  }
}
