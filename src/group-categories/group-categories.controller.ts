import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupCategoriesService } from './group-categories.service';
import { CreateGroupCategoryDto } from './dto/create-group-category.dto';
import { UpdateGroupCategoryDto } from './dto/update-group-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('group-categories')
@ApiTags('group-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupCategoriesController {
  constructor(
    private readonly groupCategoriesService: GroupCategoriesService,
  ) {}

  @Post()
  create(@Body() dto: CreateGroupCategoryDto) {
    return this.groupCategoriesService.create(dto);
  }

  @Get(':isHide')
  findAll(@Param('isHide') isHide: 'false' | 'true') {
    return this.groupCategoriesService.findAll(isHide);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupCategoryDto) {
    return this.groupCategoriesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupCategoriesService.remove(+id);
  }
}
