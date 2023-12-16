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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuditoryCategoriesService } from './auditory-categories.service';
import { CreateAuditoryCategoryDto } from './dto/create-auditory-category.dto';
import { UpdateAuditoryCategoryDto } from './dto/update-auditory-category.dto';

@Controller('auditory-categories')
@ApiTags('auditory-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditoryCategoriesController {
  constructor(
    private readonly auditoryCategoriesService: AuditoryCategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.auditoryCategoriesService.findAll();
  }

  @ApiBody({ type: UpdateAuditoryCategoryDto })
  @Post()
  create(@Body() dto: CreateAuditoryCategoryDto) {
    return this.auditoryCategoriesService.create(dto);
  }

  @ApiBody({ type: UpdateAuditoryCategoryDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuditoryCategoryDto) {
    return this.auditoryCategoriesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoryCategoriesService.remove(+id);
  }
}
